# Track Plan: Prompt Versioning & Forking

## Phase 1: Schema & Backend
- [x] Task: Create a Supabase migration to add `parent_id` to `prompt_history` <!-- id: 0 --> [commit: c027ce9]
- [ ] Task: Update `types.ts` to include `parentId` in `PromptHistoryItem`
- [ ] Task: Update `engineer-prompt` Edge Function to accept and save `parentId`
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Schema & Backend' (Protocol in workflow.md)

## Phase 2: Frontend Implementation
- [ ] Task: Update `usePromptHistory` to handle fetching relations (versions)
- [ ] Task: Update `PromptForm` to support "Forking" mode (pre-fill input, capture parent ID)
- [ ] Task: Add "Fork" button to `WorkbenchDisplay` header
- [ ] Task: Create `VersionHistory` component to display related prompts
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Implementation' (Protocol in workflow.md)

## Phase 3: Integration & Polish
- [ ] Task: Integrate `VersionHistory` into the `HistorySidebar` or `WorkbenchDisplay`
- [ ] Task: Add visual indicators for "Forked" items in the history list
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration & Polish' (Protocol in workflow.md)
