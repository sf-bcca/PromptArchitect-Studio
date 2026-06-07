import { supabase } from './supabaseClient';
import { RefinedPromptResult, AppError, ErrorCode } from "../types";
import { Capacitor } from '@capacitor/core';
import { NativeAI } from './nativeAiPlugin';

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const LOCAL_AI_URL = "/local-ai/v1/chat/completions";
const LOCAL_AI_MODEL = "gemma-4-local";

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

const LOCAL_SYSTEM_INSTRUCTION = `
ROLE: You are an expert Prompt Engineer.
OBJECTIVE: Take the user's input and transform it into a high-quality, structured prompt using the CO-STAR framework.
- Do NOT answer or execute the user's input. Your sole purpose is to re-engineer it.
- **MANDATORY FRAMEWORK**: You MUST use the **CO-STAR** framework.

OUTPUT FORMAT (Strict JSON):
You MUST return a valid JSON object matching this schema. Note that the 'costar' object is at the top of the JSON. Keep descriptions extremely concise to prevent truncation.
{
  "costar": {
     "context": "Detailed background for the LLM.",
     "objective": "The precise goal of the prompt.",
     "style": "The expert persona the LLM should adopt.",
     "tone": "The desired emotional and attitudinal quality.",
     "audience": "The target reader for the final output.",
     "response": "Strict formatting requirements for the output."
  },
  "whyThisWorks": "A very brief explanation of why this works (1 sentence).",
  "suggestedVariables": ["Variables used in the prompt, e.g. '[Audience]'"],
  "refinedPrompt": "The complete, aggregated prompt string combining the CO-STAR sections."
}

Do NOT include any markdown formatting like \`\`\`json. Just return the raw JSON string.
`;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function repairTruncatedJSON(jsonStr: string): string {
  let str = jsonStr.trim();
  if (str.endsWith(',')) {
    str = str.slice(0, -1);
  }
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && (i === 0 || str[i-1] !== '\\')) {
      inString = !inString;
    } else if (!inString) {
      if (char === '{') openBraces++;
      else if (char === '}') openBraces--;
      else if (char === '[') openBrackets++;
      else if (char === ']') openBrackets--;
    }
  }
  if (inString) {
    str += '"';
  }
  while (openBrackets > 0) {
    str += ']';
    openBrackets--;
  }
  while (openBraces > 0) {
    str += '}';
    openBraces--;
  }
  return str;
}

function cleanAndParseJSON(text: string): any {
  let cleanedText = text.trim();
  if (cleanedText.startsWith("```")) {
    const firstNewLine = cleanedText.indexOf("\n");
    if (firstNewLine !== -1) {
      cleanedText = cleanedText.substring(firstNewLine + 1);
    } else {
      cleanedText = cleanedText.substring(3);
    }
  }
  if (cleanedText.endsWith("```")) {
    cleanedText = cleanedText.substring(0, cleanedText.length - 3);
  }
  cleanedText = cleanedText.trim();
  const firstBrace = cleanedText.indexOf('{');
  const lastBrace = cleanedText.lastIndexOf('}');
  if (firstBrace === -1) {
    throw new Error("No JSON object found in response");
  }
  if (lastBrace === -1 || lastBrace < firstBrace) {
    cleanedText = cleanedText.substring(firstBrace);
    cleanedText = repairTruncatedJSON(cleanedText);
  } else {
    cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
  }
  
  const parsed = JSON.parse(cleanedText);
  const costar = parsed.costar || {};
  
  return {
    refinedPrompt: parsed.refinedPrompt || "",
    whyThisWorks: parsed.whyThisWorks || "Structured prompt engineered using the CO-STAR framework on-device.",
    suggestedVariables: parsed.suggestedVariables || [],
    costar: {
      context: costar.context || "",
      objective: costar.objective || "",
      style: costar.style || "",
      tone: costar.tone || "",
      audience: costar.audience || "",
      response: costar.response || ""
    }
  };
}

/**
 * Engineers a refined prompt using the local Gemma 4 inference service.
 * This is used as a fallback when Gemini is unavailable or when manually selected.
 * 
 * @param {string} userInput - The raw input to be engineered.
 * @returns {Promise<RefinedPromptResult>} The engineered prompt and CO-STAR components.
 */
export const engineerPromptLocal = async (userInput: string, timeoutMs: number = 30000): Promise<RefinedPromptResult> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(LOCAL_AI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gemma-4-local', // The LXC accepts this model ID
                messages: [
                    { 
                        role: 'user', 
                        content: `SYSTEM INSTRUCTION:\n${SYSTEM_INSTRUCTION.trim()}\n\nUSER INPUT:\n${userInput}` 
                    }
                ],
                response_format: { type: 'json_object' }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Local AI returned ${response.status}`);
        }

        const data = await response.json();
        const text = data.choices[0].message.content;
        
        const parsed = cleanAndParseJSON(text);
        
        return {
            ...parsed,
            provider: 'local',
            model: 'gemma-4-local'
        } as RefinedPromptResult;
    } catch (error: any) {
        throw new AppError(ErrorCode.LLM_GENERATION_FAILED, `Local AI failed: ${error.message}`);
    }
};

async function runGemmaOnDeviceInference(userInput: string): Promise<RefinedPromptResult> {
  const promptText = `SYSTEM INSTRUCTION:\n${LOCAL_SYSTEM_INSTRUCTION.trim()}\n\nUSER INPUT:\n${userInput}`;
  const response = await NativeAI.generateResponse({ prompt: promptText });
  
  const parsed = cleanAndParseJSON(response.result);
  
  // Auto-reconstruct refinedPrompt from CO-STAR blocks if it was truncated at the bottom of the JSON response
  if (!parsed.refinedPrompt || parsed.refinedPrompt.length < 50) {
    const parts = [
      parsed.costar.context ? `# Context\n${parsed.costar.context}` : "",
      parsed.costar.objective ? `# Objective\n${parsed.costar.objective}` : "",
      parsed.costar.style ? `# Style\n${parsed.costar.style}` : "",
      parsed.costar.tone ? `# Tone\n${parsed.costar.tone}` : "",
      parsed.costar.audience ? `# Audience\n${parsed.costar.audience}` : "",
      parsed.costar.response ? `# Response\n${parsed.costar.response}` : ""
    ];
    parsed.refinedPrompt = parts.filter(Boolean).join("\n\n");
  }
  
  return {
    ...parsed,
    provider: 'local',
    model: 'gemma-4-local'
  } as RefinedPromptResult;
}

/**
 * Engineers a refined prompt using Gemini (via Edge Function) with automatic local fallback.
 */
export const engineerPrompt = async (userInput: string, model?: string, provider?: string, parentId?: string | null): Promise<RefinedPromptResult> => {
  const isAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  const isLocalSelected = provider === 'local';

  // 1. If running on Android and "local" is selected in the UI dropdown, route to Gemma 4 on-device AI
  if (isAndroid && isLocalSelected) {
    try {
      const { available } = await NativeAI.isModelAvailable();
      if (available) {
        return runGemmaOnDeviceInference(userInput);
      } else {
        throw new AppError(
          ErrorCode.LLM_GENERATION_FAILED,
          "Gemma 4 on-device model is not downloaded. Please download it in the app settings to use offline AI."
        );
      }
    } catch (e) {
      if (e instanceof AppError) throw e;
      console.warn("Explicit on-device Gemma execution failed, falling back to local VM...", e);
    }
  }

  // 2. Direct route for local model selection (Gemma 4 proxy on desktop or fallback)
  if (isLocalSelected) {
    return engineerPromptLocal(userInput);
  }

  // 3. For cloud models, try the Supabase Edge Function first
  let attempt = 0;
  let firstError: any = null;
  while (true) {
    try {
      const { data, error } = await supabase.functions.invoke('engineer-prompt', {
        body: { userInput, model, provider, parentId }
      });

      if (error) {
        let errorCode = ErrorCode.LLM_GENERATION_FAILED;
        let errorMessage = error.message || "Failed to engineer prompt.";
        
        if (error.message?.includes("503")) {
          errorCode = ErrorCode.LLM_SERVICE_UNAVAILABLE;
        } else if (error.message?.includes("429")) {
          errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
        }

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
      if (!firstError) {
        firstError = error;
      }

      // If it is LLM_SERVICE_UNAVAILABLE (503 overloaded), attempt fallback once, then fail fast
      if (error instanceof AppError && error.code === ErrorCode.LLM_SERVICE_UNAVAILABLE) {
        // A. If on Android, try Gemma 4 on-device first
        if (isAndroid) {
          try {
            const { available } = await NativeAI.isModelAvailable();
            if (available) {
              return runGemmaOnDeviceInference(userInput);
            }
          } catch (gemmaError) {
            console.error("On-device fallback also failed:", gemmaError);
          }
        }

        // B. Try remote Gemma 4 proxy fallback
        try {
          const fallbackResult = await engineerPromptLocal(userInput, 2000);
          return { ...fallbackResult, id: "fallback-" + Date.now() };
        } catch (fallbackError) {
          console.error("Local VM fallback also failed:", fallbackError);
        }

        throw error;
      }

      // For general app failures (other than network errors), throw immediately
      if (error instanceof AppError && error.code !== ErrorCode.NETWORK_ERROR) {
        throw error;
      }

      console.warn("Cloud model request failed. Attempting on-device/local fallback...", error);
      
      // A. If on Android, try Gemma 4 on-device first
      if (isAndroid) {
        try {
          const { available } = await NativeAI.isModelAvailable();
          if (available) {
            return runGemmaOnDeviceInference(userInput);
          }
        } catch (gemmaError) {
          console.error("On-device fallback also failed:", gemmaError);
        }
      }

      // B. Try remote Gemma 4 proxy fallback
      try {
        const fallbackResult = await engineerPromptLocal(userInput, 2000);
        return { ...fallbackResult, id: "fallback-" + Date.now() };
      } catch (fallbackError) {
        console.error("Local VM fallback also failed:", fallbackError);
      }

      if (attempt < MAX_RETRIES) {
        await delay(BASE_DELAY);
        attempt++;
        continue;
      }

      if (firstError) {
        if (firstError instanceof AppError) {
          throw firstError;
        } else {
          throw new AppError(
            ErrorCode.NETWORK_ERROR,
            firstError.message || "All AI services are currently unreachable. Please check your network connection.",
            { originalError: firstError }
          );
        }
      }

      throw new AppError(
        ErrorCode.NETWORK_ERROR,
        "All AI services are currently unreachable. Please check your network connection."
      );
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
