
import { supabase } from './supabaseClient';
import { RefinedPromptResult, AppError, ErrorCode } from "../types";

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Engineers a refined prompt from a basic user input using the 'engineer-prompt' Supabase Edge Function.
 *
 * @param {string} userInput - The basic idea or request from the user.
 * @returns {Promise<RefinedPromptResult>} A promise that resolves to the engineered prompt result,
 * including the refined prompt, explanation, and variable suggestions.
 * @throws {AppError} Throws an AppError if the Edge Function invocation fails or if there is a connection issue.
 */
export const engineerPrompt = async (userInput: string, model?: string, provider?: string): Promise<RefinedPromptResult> => {
  let attempt = 0;
  
  while (true) {
    try {
      // Invoke the Supabase Edge Function 'engineer-prompt' which handles the Gemini API interaction securely
      const { data, error } = await supabase.functions.invoke('engineer-prompt', {
        body: { userInput, model, provider }
      });

      if (error) {
        console.error("Supabase Function Error:", error);
        
        // Default error details
        let errorCode = ErrorCode.LLM_GENERATION_FAILED;
        let errorMessage = error.message || "Failed to engineer prompt.";

        // Attempt to parse structured error from response if available
        // Note: Supabase functions.invoke error objects might contain the response body in various ways
        // based on the client version. We'll check for errorCode if it's already there or if message is JSON.
        try {
            if (error.context?.json) {
                const body = await error.context.json();
                if (body.errorCode) errorCode = body.errorCode;
                if (body.error) errorMessage = body.error;
            }
        } catch (e) {
            // Ignore parse errors, stick to defaults
        }

        throw new AppError(
            errorCode, 
            errorMessage, 
            { originalError: error }
        );
      }

      return data as RefinedPromptResult;
    } catch (error: any) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      // Don't retry if it's already an AppError (system error from function response)
      if (error instanceof AppError) {
          throw error;
      }

      if (attempt >= MAX_RETRIES) {
        throw new AppError(
            ErrorCode.NETWORK_ERROR, 
            error.message || "Failed to connect to the engineering service after multiple attempts.", 
            { originalError: error }
        );
      }

      // Wait before retrying (exponential backoff could be added here)
      await delay(BASE_DELAY);
      attempt++;
    }
  }
};

/**
 * Generates a concise title for a given input using the 'engineer-prompt' Edge Function with task='title'.
 *
 * @param {string} userInput - The text to summarize into a title.
 * @param {string} [model] - Optional model override.
 * @returns {Promise<string>} A promise that resolves to the generated title.
 */
export const generateTitle = async (userInput: string, model?: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('engineer-prompt', {
      body: { userInput, model, task: 'title' }
    });

    if (error) {
       console.warn("Supabase Function Error (Title):", error);
       return ""; // Fail silently for titles
    }

    return data.title || "";
  } catch (error) {
    console.warn("Failed to generate title:", error);
    return "";
  }
};
