
import { supabase } from './supabaseClient';
import { RefinedPromptResult } from "../types";

export const engineerPrompt = async (userInput: string): Promise<RefinedPromptResult> => {
  try {
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
