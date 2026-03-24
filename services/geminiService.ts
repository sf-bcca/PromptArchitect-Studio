import { supabase } from './supabaseClient';
import { RefinedPromptResult, ErrorCode, AppError } from '../types';

// Maximum number of retries for the engineering service
const MAX_RETRIES = 3;
// Base delay for exponential backoff (ms)
const BASE_DELAY = 1000;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Engineers a refined prompt from a basic user input using the 'engineer-prompt' Supabase Edge Function
 * or a local Gemma 3 instance if selected.
 *
 * @param {string} userInput - The basic idea or request from the user.
 * @param {string} [model] - The specific model ID to use.
 * @param {string} [provider] - The provider ('gemini' or 'gemma-local').
 * @param {string | null} [parentId] - The ID of a parent prompt for versioning.
 * @returns {Promise<RefinedPromptResult>} A promise that resolves to the engineered prompt result.
 * @throws {AppError} Throws an AppError if the engineering process fails.
 */
export const engineerPrompt = async (
    userInput: string, 
    model?: string, 
    provider: string = 'gemini', 
    parentId?: string | null
): Promise<RefinedPromptResult> => {
   
   // Handle Local Gemma 3 Routing
   if (provider === 'gemma-local') {
       const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

       try {
           // Call the local LiteRT-LM endpoint (supports OpenAI-compatible chat/completions)
           // and we'll transform it into our internal format
           const response = await fetch('http://localhost:8080/v1/chat/completions', {
               signal: controller.signal,
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   model: 'gemma-3-local',
                   messages: [
                       { 
                           role: 'system', 
                           content: 'You are an expert Prompt Engineer. Transform the user input into a high-quality CO-STAR prompt. Output valid JSON with fields: refinedPrompt, whyThisWorks, suggestedVariables (array), costar (object with context, objective, style, tone, audience, response fields).'
                       },
                       { role: 'user', content: userInput }
                   ],
                   response_format: { type: 'json_object' }
               })
           });

           clearTimeout(timeoutId);

           if (!response.ok) throw new Error(`Local server returned ${response.status}`);
           
           const data = await response.json();
           
           let content;
           try {
               content = JSON.parse(data.choices[0].message.content);
           } catch (e) {
               throw new Error("Local model returned invalid JSON format.");
           }
           
           return {
               refinedPrompt: content.refinedPrompt || '',
               whyThisWorks: content.whyThisWorks || '',
               suggestedVariables: content.suggestedVariables || [],
               costar: content.costar || { context: '', objective: '', style: '', tone: '', audience: '', response: '' },
               provider: 'gemma-local',
               model: 'gemma-3-local'
           } as RefinedPromptResult;
       } catch (err: any) {
           clearTimeout(timeoutId);
           throw new AppError(
               ErrorCode.LLM_SERVICE_UNAVAILABLE,
               `Local Gemma 3 service is unavailable: ${err.message}. Please ensure the LiteRT-LM server is running on port 8080.`,
               { originalError: err.message },
               true
           );
       }
   }

  let attempt = 0;
  
  while (true) {
    try {
      // Invoke the Supabase Edge Function 'engineer-prompt' which handles the Gemini API interaction securely
      const { data, error } = await supabase.functions.invoke('engineer-prompt', {
        body: { userInput, model, parentId },
      });

      if (error) {
        // Default error details
        let errorCode = ErrorCode.LLM_GENERATION_FAILED;
        let errorMessage = error.message || "Failed to engineer prompt.";

        // Attempt to parse structured error from response if available
        try {
            if (error.context?.json) {
                const body = await error.context.json();
                if (body.errorCode) errorCode = body.errorCode;
                if (body.error) errorMessage = body.error;
            }
        } catch (e) {
            // Ignore parse errors, stick to defaults
        }

        // Specifically handle 503/Service Unavailable to suggest fallback
        if (errorMessage.includes("503") || errorCode === ErrorCode.LLM_SERVICE_UNAVAILABLE) {
            errorMessage = `Gemini is currently experiencing high demand (${model}). Please try a different model or use local Gemma 3 if available.`;
            errorCode = ErrorCode.LLM_SERVICE_UNAVAILABLE;
        }

        throw new AppError(
            errorCode, 
            errorMessage, 
            { originalError: error }
        );
      }

      return data as RefinedPromptResult;

    } catch (error: any) {
      // Only rethrow if we've exhausted retries or it's a non-retryable AppError
      const isRetryable = !(error instanceof AppError) || 
                          [ErrorCode.LLM_SERVICE_UNAVAILABLE, ErrorCode.NETWORK_ERROR, ErrorCode.LLM_GENERATION_FAILED].includes(error.code);

      if (!isRetryable || attempt >= MAX_RETRIES) {
          if (error instanceof AppError) throw error;
          throw new AppError(
              ErrorCode.LLM_GENERATION_FAILED, 
              error.message || "Failed to connect to the engineering service after multiple attempts.", 
              { originalError: error }
          );
      }

      // Exponential backoff
      const retryDelay = BASE_DELAY * Math.pow(2, attempt);
      await delay(retryDelay);
      attempt++;
    }
  }
};

/**
 * Generates a short, descriptive title for a prompt using the LLM.
 *
 * @param {string} userInput - The user's original prompt idea.
 * @param {string} [model] - The model ID to use for title generation.
 * @returns {Promise<string>} A descriptive title.
 */
export const generateTitle = async (userInput: string, model?: string): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke('engineer-prompt', {
            body: { 
                userInput,
                model,
                task: 'title'
            },
        });

        if (error || !data?.title) return "Untitled Prompt";
        return data.title.replace(/["']/g, '').trim();
    } catch (e) {
        return "Untitled Prompt";
    }
};
