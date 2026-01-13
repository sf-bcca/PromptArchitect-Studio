# Track Spec: Error Handling & User Notifications

## Overview
Implement a comprehensive error handling system across the frontend and edge functions to gracefully handle LLM provider failures, network timeouts, and Supabase connectivity issues.

## Objectives
- Centralize error catching in `services/geminiService.ts` and `services/supabaseClient.ts`.
- Create a reusable `Notification` component or use a library for toast notifications.
- Ensure the user is informed with actionable messages (e.g., "Ollama is offline - try switching to Gemini").
- Log errors to a central location (Supabase logs or console in dev) without leaking secrets.

## Scope
- **Frontend:** UI components (`PromptForm`, `ResultDisplay`) should handle loading/error states.
- **Edge Functions:** `engineer-prompt` should return clear, structured error responses.
- **Services:** Retry logic for transient network failures.

## Success Criteria
- 80% test coverage for error paths.
- No silent failures during LLM generation.
- Clear distinction between "User Error" (invalid input) and "System Error" (service down).
