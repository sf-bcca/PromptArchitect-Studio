/**
 * Represents the granular CO-STAR components of a prompt.
 */
export interface CostarComponents {
  context: string;
  objective: string;
  style: string;
  tone: string;
  audience: string;
  response: string;
}

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
  /** The granular CO-STAR components breakdown. Optional for backward compatibility. */
  costar?: CostarComponents;
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
  /** The ID of the parent prompt history item, if this is a fork/version. */
  parentId?: string;
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

/**
 * Standard error codes for the application.
 */
export enum ErrorCode {
  /** The LLM service (Gemini/Ollama) is unreachable or timed out. */
  LLM_SERVICE_UNAVAILABLE = 'LLM_SERVICE_UNAVAILABLE',
  /** The service returned a 400/500 error or invalid response. */
  LLM_GENERATION_FAILED = 'LLM_GENERATION_FAILED',
  /** The user's input failed validation (e.g., too short). */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Network error connecting to Supabase or Edge Functions. */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** Authentication or authorization failure. */
  AUTH_ERROR = 'AUTH_ERROR',
  /** An unexpected or unhandled error occurred. */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class for application-specific errors with consistent structure.
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly isUserError: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>,
    isUserError: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.isUserError = isUserError;
  }
}

/**
 * Type guard to check if an error is an instance of AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}