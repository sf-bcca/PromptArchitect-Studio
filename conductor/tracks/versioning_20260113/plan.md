# Track Plan: Prompt Versioning & Forking

## Phase 1: Schema & Backend [checkpoint: 4405b3c]
- [x] Task: Create a Supabase migration to add `parent_id` to `prompt_history` <!-- id: 0 --> [commit: c027ce9]
- [x] Task: Update `types.ts` to include `parentId` in `PromptHistoryItem` <!-- id: 1 --> [commit: 9038822]
- [x] Task: Update `engineer-prompt` Edge Function to accept and save `parentId` <!-- id: 2 --> [commit: 4405b3c]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Schema & Backend' (Protocol in workflow.md) <!-- id: 3 --> [commit: 4405b3c]

## Phase 2: Frontend Implementation
- [x] Task: Update `usePromptHistory` to handle fetching relations (versions) <!-- id: 4 --> [commit: c1f24a9]
- [x] Task: Update `PromptForm` to support "Forking" mode (pre-fill input, capture parent ID) <!-- id: 5 --> [commit: 03fcd5a]
- [x] Task: Add "Fork" button to `WorkbenchDisplay` header <!-- id: 6 --> [commit: 03fcd5a]
- [x] Task: Create `VersionHistory` component to display related prompts <!-- id: 7 --> [commit: be34e65]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Frontend Implementation' (Protocol in workflow.md) <!-- id: 8 --> [commit: be34e65]

## Phase 3: Integration & Polish
- [~] Task: Integrate `VersionHistory` into the `HistorySidebar` or `WorkbenchDisplay`
- [~] Task: Add visual indicators for "Forked" items in the history list
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration & Polish' (Protocol in workflow.md)
