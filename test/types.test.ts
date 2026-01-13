import { describe, it, expect } from 'vitest';
import { AppError, ErrorCode, isAppError, RefinedPromptResult } from '../types';

describe('AppError', () => {
  it('should create an AppError with code, message, and details', () => {
    const error = new AppError(ErrorCode.LLM_SERVICE_UNAVAILABLE, 'Service down', { provider: 'Gemini' });
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ErrorCode.LLM_SERVICE_UNAVAILABLE);
    expect(error.message).toBe('Service down');
    expect(error.details).toEqual({ provider: 'Gemini' });
    expect(error.isUserError).toBe(false); 
  });

  it('should correctly identify user errors', () => {
     const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input', {}, true);
     expect(error.isUserError).toBe(true);
  });
});

describe('isAppError', () => {
  it('should return true for AppError instances', () => {
    const error = new AppError(ErrorCode.UNKNOWN_ERROR, 'Unknown');
    expect(isAppError(error)).toBe(true);
  });

  it('should return false for standard Error instances', () => {
    const error = new Error('Standard error');
    expect(isAppError(error)).toBe(false);
  });

  it('should return false for non-error objects', () => {
    expect(isAppError({ message: 'test' })).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});

describe('RefinedPromptResult Type', () => {
    it('should support CO-STAR granular fields', () => {
        const result: RefinedPromptResult = {
            refinedPrompt: "Full prompt",
            whyThisWorks: "Because...",
            suggestedVariables: [],
            // These should be optional but valid
            costar: {
                context: "Context...",
                objective: "Objective...",
                style: "Style...",
                tone: "Tone...",
                audience: "Audience...",
                response: "Response..."
            }
        };
        expect(result.costar?.context).toBe("Context...");
    });
});