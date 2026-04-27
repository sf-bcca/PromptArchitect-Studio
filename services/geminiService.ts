import { supabase } from './supabaseClient';
import { RefinedPromptResult, AppError, ErrorCode } from "../types";

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const LOCAL_AI_URL = "/local-ai/v1/chat/completions";
const LOCAL_AI_MODEL = "gemma-3-local";

const SYSTEM_INSTRUCTION = `
ROLE: You are an expert Prompt Engineer.
OBJECTIVE: Take the user's input and transform it into a high-quality, structured prompt.
- Do NOT answer or execute the user's input. Your sole purpose is to re-engineer it.
- **MANDATORY FRAMEWORK**: You MUST use the **CO-STAR** framework for the "Refined Prompt".
  1. **C**ontext: Detailed background for the LLM.
  2. **O**bjective: The precise goal of the prompt.
  3. **S**tyle: The expert persona the LLM should adopt.
  4. **T**one: The desired emotional and attitudinal quality of the response.
  5. **A**udience: The target reader for the final output.
  6. **R**esponse: Strict formatting requirements for the LLM's output.

OUTPUT FORMAT (Strict JSON):
You MUST return a valid JSON object matching this schema. You MUST populate the 'costar' object with the specific content used in the refined prompt.
{
  "refinedPrompt": "The complete, aggregated prompt string ready for an LLM",
  "whyThisWorks": "An explanation of the prompt engineering techniques used and why they are effective.",
  "suggestedVariables": ["A list of potential variables for customization, e.g., '[Audience]', '[Topic]'"],
  "costar": {
     "context": "The Context string written for the refined prompt.",
     "objective": "The Objective string written for the refined prompt.",
     "style": "The Style string written for the refined prompt.",
     "tone": "The Tone string written for the refined prompt.",
     "audience": "The Audience string written for the refined prompt.",
     "response": "The Response string written for the refined prompt."
  }
}

Do NOT include any markdown formatting like \`\`\`json. Just return the raw JSON string.
`;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Directly calls the local Gemma 4 Inference LXC.
 */
export const engineerPromptLocal = async (userInput: string): Promise<RefinedPromptResult> => {
    try {
        const response = await fetch(LOCAL_AI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gemma-3-local', // The LXC accepts this model ID
                messages: [
                    { 
                        role: 'user', 
                        content: `SYSTEM INSTRUCTION:\n${SYSTEM_INSTRUCTION.trim()}\n\nUSER INPUT:\n${userInput}` 
                    }
                ],
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            throw new Error(`Local AI returned ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;
        
        // Robust JSON parsing: extract JSON block if it's wrapped in conversational text
        let cleanedText = text.trim();
        const firstBrace = cleanedText.indexOf('{');
        const lastBrace = cleanedText.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
        }
        
        let parsed;
        try {
            parsed = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Local AI JSON parse failed. Raw text:", text);
            // If it starts with "I do not h", it's likely a refusal/answering the prompt
            if (text.toLowerCase().includes("i do not have") || text.toLowerCase().includes("i am an ai")) {
                 throw new Error("Model refused to engineer the prompt and instead tried to answer it. Try a more specific engineering request.");
            }
            throw new Error(`Invalid JSON format. Received: ${text.substring(0, 50)}...`);
        }
        
        return {
            ...parsed,
            provider: 'local',
            model: 'gemma-4-local'
        } as RefinedPromptResult;
    } catch (error: any) {
        throw new AppError(ErrorCode.LLM_GENERATION_FAILED, `Local AI failed: ${error.message}`);
    }
};

/**
 * Engineers a refined prompt using Gemini (via Edge Function) with automatic local fallback.
 */
export const engineerPrompt = async (userInput: string, model?: string, provider?: string, parentId?: string | null): Promise<RefinedPromptResult> => {
  // Direct route for local model selection
  if (provider === 'local') {
      return engineerPromptLocal(userInput);
  }

  let attempt = 0;
  
  while (true) {
    try {
      const { data, error } = await supabase.functions.invoke('engineer-prompt', {
        body: { userInput, model, provider, parentId }
      });

      if (error) {
        // Check for 503/429 for automatic fallback
        if (error.message?.includes("503") || error.message?.includes("429")) {
            console.warn("Gemini overloaded, attempting local fallback...");
            try {
                const fallbackResult = await engineerPromptLocal(userInput);
                return { ...fallbackResult, id: "fallback-" + Date.now() }; 
            } catch (fallbackError) {
                console.error("Local fallback also failed:", fallbackError);
            }
        }

        let errorCode = ErrorCode.LLM_GENERATION_FAILED;
        let errorMessage = error.message || "Failed to engineer prompt.";

        try {
            if (error.context?.json) {
                const body = await error.context.json();
                if (body.errorCode) errorCode = body.errorCode;
                if (body.error) errorMessage = body.error;
            }
        } catch (e) {}

        throw new AppError(errorCode, errorMessage, { originalError: error });
      }

      return data as RefinedPromptResult;
    } catch (error: any) {
      if (error instanceof AppError) throw error;

      if (attempt >= MAX_RETRIES) {
        throw new AppError(
            ErrorCode.NETWORK_ERROR, 
            error.message || "Failed to connect to the engineering service.", 
            { originalError: error }
        );
      }

      await delay(BASE_DELAY);
      attempt++;
    }
  }
};

/**
 * Generates a concise title.
 */
export const generateTitle = async (userInput: string, model?: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('engineer-prompt', {
      body: { userInput, model, task: 'title' }
    });

    if (error) return "";
    return data.title || "";
  } catch (error) {
    return "";
  }
};
