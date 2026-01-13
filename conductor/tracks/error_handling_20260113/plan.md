# Track Plan: Error Handling & User Notifications

## Phase 1: Service Layer Hardening [checkpoint: a7d9111]
- [x] Task: Define standard Error types in `types.ts` <!-- id: 0 --> [commit: abef6ff]
- [x] Task: Implement error catching and retry logic in `services/geminiService.ts` <!-- id: 1 --> [commit: e8b823c]
- [x] Task: Implement error catching in `services/supabaseClient.ts` <!-- id: 2 --> [commit: a79218e]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Service Layer Hardening' (Protocol in workflow.md) <!-- id: 3 --> [commit: a7d9111]

## Phase 2: Backend (Edge Function) Reliability
- [ ] Task: Update `engineer-prompt` Edge Function to return consistent JSON error objects
- [ ] Task: Add unit tests for edge function error scenarios
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Backend (Edge Function) Reliability' (Protocol in workflow.md)

## Phase 3: UI Notifications & Feedback
- [ ] Task: Create a toast/notification system for global error display
- [ ] Task: Update `PromptForm` to handle and display submission errors
- [ ] Task: Add E2E tests for simulated service outages
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Notifications & Feedback' (Protocol in workflow.md)
