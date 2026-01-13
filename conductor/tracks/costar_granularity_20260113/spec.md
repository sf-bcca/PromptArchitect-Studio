# Track Spec: Enhanced CO-STAR Granularity & Workbench UI

## Overview
Transform PromptArchitect-Studio from a simple prompt generator into a true engineering workbench by explicitly breaking down and displaying the CO-STAR components (Context, Objective, Style, Tone, Audience, Response).

## Objectives
- **Granular Data:** Modify the `engineer-prompt` Edge Function to return each CO-STAR element as a separate field in the JSON response.
- **Database Schema:** Update the `RefinedPromptResult` type and `prompt_history` JSON structure to persist these granular fields.
- **Workbench UI:** Replace the simple text display with a "Workbench" component that displays these fields in a grid or tabbed layout, allowing users to see exactly how their prompt is constructed.

## Scope
- **Backend:** Update Edge Function system prompt and Zod schema.
- **Frontend:** Update `types.ts`, create `WorkbenchDisplay` component, update `ResultDisplay`.
- **Persistence:** Ensure new fields are saved to Supabase (backward compatibility required for old records).

## Success Criteria
- Users can view "Context", "Objective", etc., as distinct sections in the UI.
- The "Refined Prompt" is still available as the assembled final output.
- Existing history items load without errors (handling missing fields gracefully).
