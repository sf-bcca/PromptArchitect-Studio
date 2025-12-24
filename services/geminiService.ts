
import { supabase } from './supabaseClient';
import { RefinedPromptResult } from "../types";

/**
 * Engineers a refined prompt from a basic user input using the 'engineer-prompt' Supabase Edge Function.
 *
 * @param {string} userInput - The basic idea or request from the user.
 * @returns {Promise<RefinedPromptResult>} A promise that resolves to the engineered prompt result,
 * including the refined prompt, explanation, and variable suggestions.
 * @throws {Error} Throws an error if the Edge Function invocation fails or if there is a connection issue.
 */
export const engineerPrompt = async (userInput: string): Promise<RefinedPromptResult> => {
  try {
    // Invoke the Supabase Edge Function 'engineer-prompt' which handles the Gemini API interaction securely
    const { data, error } = await supabase.functions.invoke('engineer-prompt', {
      body: { userInput }
    });

    if (error) {
      console.error("Supabase Function Error:", error);
      throw new Error(error.message || "Failed to engineer prompt.");
    }

    return data as RefinedPromptResult;
  } catch (error: any) {
    console.error("Connection Error:", error);
    throw new Error(error.message || "Failed to connect to the engineering service.");
  }
};
