
/**
 * Represents the structured result of an engineered prompt from the AI service.
 */
export interface RefinedPromptResult {
  /** A unique identifier for the result, typically assigned on creation. */
  id?: string;
  /** The final engineered prompt text, ready for use with an LLM. */
  refinedPrompt: string;
  /** An explanation of the techniques used to generate the prompt. */
  whyThisWorks: string;
  /** A list of dynamic variables found in the prompt (e.g., [Target Audience]). */
  suggestedVariables: string[];
  /** The LLM provider used (e.g., 'gemini', 'ollama'). */
  provider?: string;
  /** The specific model used (e.g., 'llama3.2', 'gemini-3-flash-preview'). */
  model?: string;
  /** A user-defined custom title for this prompt session. */
  customTitle?: string;
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

/**
 * Represents a user's favorite prompt, linked to a history item.
 */
export interface FavoriteItem {
  id: string;
  user_id: string;
  prompt_history_id: string;
  created_at: string;
  /** The full prompt history item, joined for display convenience. */
  prompt_history?: PromptHistoryItem;
}
