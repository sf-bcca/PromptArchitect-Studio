# Track Plan: Error Handling & User Notifications

## Phase 1: Service Layer Hardening
- [ ] Task: Define standard Error types in `types.ts`
- [ ] Task: Implement error catching and retry logic in `services/geminiService.ts`
- [ ] Task: Implement error catching in `services/supabaseClient.ts`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Service Layer Hardening' (Protocol in workflow.md)

## Phase 2: Backend (Edge Function) Reliability
- [ ] Task: Update `engineer-prompt` Edge Function to return consistent JSON error objects
- [ ] Task: Add unit tests for edge function error scenarios
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Backend (Edge Function) Reliability' (Protocol in workflow.md)

## Phase 3: UI Notifications & Feedback
- [ ] Task: Create a toast/notification system for global error display
- [ ] Task: Update `PromptForm` to handle and display submission errors
- [ ] Task: Add E2E tests for simulated service outages
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Notifications & Feedback' (Protocol in workflow.md)
