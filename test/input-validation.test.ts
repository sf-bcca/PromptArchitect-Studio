
import { describe, it, expect } from 'vitest';

// Mirror of the logic in supabase/functions/engineer-prompt/index.ts
// We test this logic here because we cannot easily import the Deno-based edge function in this Node environment.
function validateInput(userInput: any): { valid: boolean; error?: string } {
    if (typeof userInput !== "string" || userInput.length > 5000) {
        return { valid: false, error: "Input invalid or too long. Max 5000 characters." };
    }
    return { valid: true };
}

describe('Input Validation Logic (Mirrored)', () => {
    it('should accept valid strings under 5000 chars', () => {
        const input = "Valid input";
        const result = validateInput(input);
        expect(result.valid).toBe(true);
    });

    it('should reject non-string input', () => {
        const input = 12345;
        const result = validateInput(input);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Input invalid or too long");
    });

    it('should reject strings longer than 5000 chars', () => {
        const input = "a".repeat(5001);
        const result = validateInput(input);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Input invalid or too long");
    });

    it('should accept strings exactly 5000 chars', () => {
        const input = "a".repeat(5000);
        const result = validateInput(input);
        expect(result.valid).toBe(true);
    });
});
