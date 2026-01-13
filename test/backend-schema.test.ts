import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Mirrored Schema from Edge Function
const RefinedPromptSchema = z.object({
  refinedPrompt: z.string(),
  whyThisWorks: z.string(),
  suggestedVariables: z.array(z.string()),
  costar: z.object({
    context: z.string(),
    objective: z.string(),
    style: z.string(),
    tone: z.string(),
    audience: z.string(),
    response: z.string(),
  }).describe("Breakdown of the CO-STAR components"),
});

describe('Edge Function Schema', () => {
  it('should validate a complete granular response', () => {
    const validResponse = {
      refinedPrompt: "Full prompt...",
      whyThisWorks: "Reason...",
      suggestedVariables: ["[Var]"],
      costar: {
        context: "Ctx",
        objective: "Obj",
        style: "Sty",
        tone: "Tne",
        audience: "Aud",
        response: "Res"
      }
    };
    
    const parsed = RefinedPromptSchema.parse(validResponse);
    expect(parsed.costar.context).toBe("Ctx");
  });

  it('should fail if costar is missing', () => {
    const invalidResponse = {
      refinedPrompt: "Full prompt...",
      whyThisWorks: "Reason...",
      suggestedVariables: ["[Var]"]
    };
    
    expect(() => RefinedPromptSchema.parse(invalidResponse)).toThrow();
  });
});
