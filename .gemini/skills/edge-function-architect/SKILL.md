---
name: edge-function-architect
description: Scaffolds Supabase Edge Functions with mirrored validation logic for Node.js testing. Use when creating new backend functions to ensure testability.
---

# Edge Function Architect

This skill enforces the "Mirrored Logic" pattern required by this project's unique Deno/Node hybrid architecture.

## The Problem
Supabase Edge Functions run on **Deno**, but our test suite runs on **Node.js** (Vitest). This makes sharing code (like validation logic and types) difficult without a complex build step.

## The Solution: Mirrored Logic
We explicitly duplicate the core validation logic in the test file. This ensures that even though the runtimes are different, the business rules are verified locally before deployment.

## Usage

### Scaffold a New Function
This command creates both the Deno Edge Function and its corresponding "Mirrored Logic" test file.

```bash
node .gemini/skills/edge-function-architect/scripts/scaffold_edge_function.cjs <function-name>
```

### Example
To create a new function called `process-receipts`:
```bash
node .gemini/skills/edge-function-architect/scripts/scaffold_edge_function.cjs process-receipts
```

**Output:**
1. `supabase/functions/process-receipts/index.ts` (The Deno backend)
2. `test/process-receipts-logic.test.ts` (The Vitest mirror)

## Workflow
1. **Scaffold**: Run the command above.
2. **Verify**: Run `pnpm test` immediately to ensure the boilerplate passes.
3. **Implement**:
   - Add your business logic to the `index.ts` file.
   - **Crucial**: Copy any validation rules or schema checks into the `test` file's `validateInput` mock.
   - Update tests to cover the new logic.