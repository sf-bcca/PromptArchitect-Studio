
import { GoogleGenAI, Type } from "@google/genai";
import { RefinedPromptResult } from "../types";

export const engineerPrompt = async (userInput: string): Promise<RefinedPromptResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an expert Prompt Engineer and LLM Specialist. Your goal is to take a user's basic idea and transform it into a high-performance, structured prompt.
    
    The Framework You Must Use for the "refinedPrompt":
    - Role: Define a specific persona.
    - Context/Background: Explain why this task is being done and what information the AI needs.
    - Task: A clear, action-oriented description of what the AI must do.
    - Constraints & Guidelines: Specific "do's and don'ts".
    - Output Format: Define how the result should look.

    You must return a JSON object containing:
    1. "refinedPrompt": The main block the user will copy. Use placeholders like [INSERT DATA HERE].
    2. "whyThisWorks": A brief explanation of prompt engineering techniques used (e.g., "Chain of Thought", "Persona Assignment").
    3. "suggestedVariables": A list of details the user could add to make the prompt better.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userInput,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 4000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refinedPrompt: { type: Type.STRING },
            whyThisWorks: { type: Type.STRING },
            suggestedVariables: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['refinedPrompt', 'whyThisWorks', 'suggestedVariables']
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as RefinedPromptResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to engineer prompt. Please try again.");
  }
};
