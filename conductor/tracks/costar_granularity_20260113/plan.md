# Track Plan: Enhanced CO-STAR Granularity & Workbench UI

## Phase 1: Backend & Schema Updates
- [x] Task: Update `types.ts` to include optional CO-STAR fields in `RefinedPromptResult` <!-- id: 0 --> [commit: dc06a2c]
- [ ] Task: Update `engineer-prompt` Edge Function Zod schema and system prompt to request granular JSON output
- [ ] Task: Verify Edge Function returns new structure with unit tests
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend & Schema Updates' (Protocol in workflow.md)

## Phase 2: Frontend Workbench UI
- [ ] Task: Create `CostarSection` component for displaying individual fields
- [ ] Task: Update `ResultDisplay` to use a new layout (Workbench) when CO-STAR data is present
- [ ] Task: Ensure backward compatibility for history items without CO-STAR data
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Workbench UI' (Protocol in workflow.md)

## Phase 3: Integration & Polish
- [ ] Task: Update `PromptCard` to optionally show the breakdown or just the final prompt
- [ ] Task: Add "Copy" buttons for individual sections
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration & Polish' (Protocol in workflow.md)
