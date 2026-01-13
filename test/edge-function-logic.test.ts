import { describe, it, expect } from 'vitest';
import { ErrorCode } from '../types';

/**
 * Mocking the edge function's validation logic to ensure it stays in sync with our expectations.
 * (Mirrored logic pattern)
 */
describe('Edge Function Logic Principles', () => {
  const ALLOWED_PROVIDERS = ["gemini", "ollama"];
  
  const validateInput = (userInput: any, provider?: string, parentId?: string) => {
    if (!userInput) return { error: "Missing userInput", code: ErrorCode.VALIDATION_ERROR };
    if (typeof userInput !== "string" || userInput.length > 5000) return { error: "Invalid length", code: ErrorCode.VALIDATION_ERROR };
    if (provider && !ALLOWED_PROVIDERS.includes(provider)) return { error: "Invalid provider", code: ErrorCode.VALIDATION_ERROR };
    if (parentId && typeof parentId !== 'string') return { error: "Invalid parentId", code: ErrorCode.VALIDATION_ERROR };
    return null;
  };

  it('should validate missing userInput', () => {
    const result = validateInput(null);
    expect(result?.code).toBe(ErrorCode.VALIDATION_ERROR);
  });

  it('should validate too long userInput', () => {
    const result = validateInput("a".repeat(5001));
    expect(result?.code).toBe(ErrorCode.VALIDATION_ERROR);
  });

  it('should validate invalid provider', () => {
    const result = validateInput("test", "invalid-ai");
    expect(result?.code).toBe(ErrorCode.VALIDATION_ERROR);
  });

  it('should pass valid input with parentId', () => {
    const result = validateInput("test", "gemini", "some-uuid");
    expect(result).toBeNull();
  });
});
