
/**
 * Represents the structured result of an engineered prompt from the AI service.
 */
export interface RefinedPromptResult {
  /** The final engineered prompt text, ready for use with an LLM. */
  refinedPrompt: string;
  /** An explanation of the techniques used to generate the prompt. */
  whyThisWorks: string;
  /** A list of dynamic variables found in the prompt (e.g., [Target Audience]). */
  suggestedVariables: string[];
}

/**
 * Represents a historical record of a user's prompt engineering session.
 */
export interface PromptHistoryItem {
  /** Unique identifier for the history item (UUID). */
  id: string;
  /** The original raw input provided by the user. */
  originalInput: string;
  /** The engineered result returned by the service. */
  result: RefinedPromptResult;
  /** Unix timestamp (in milliseconds) of when the prompt was created. */
  timestamp: number;
}
