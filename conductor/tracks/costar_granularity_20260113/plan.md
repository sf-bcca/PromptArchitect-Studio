# Track Plan: Enhanced CO-STAR Granularity & Workbench UI

## Phase 1: Backend & Schema Updates [checkpoint: 9b32b57]
- [x] Task: Update `types.ts` to include optional CO-STAR fields in `RefinedPromptResult` <!-- id: 0 --> [commit: dc06a2c]
- [x] Task: Update `engineer-prompt` Edge Function Zod schema and system prompt to request granular JSON output <!-- id: 1 --> [commit: ed61cd5]
- [x] Task: Verify Edge Function returns new structure with unit tests <!-- id: 2 --> [commit: 8aba631]
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend & Schema Updates' (Protocol in workflow.md) <!-- id: 3 --> [commit: 9b32b57]

## Phase 2: Frontend Workbench UI
- [x] Task: Create `CostarSection` component for displaying individual fields <!-- id: 4 --> [commit: 6578311]
- [x] Task: Update `ResultDisplay` to use a new layout (Workbench) when CO-STAR data is present <!-- id: 5 --> [commit: 6578311]
- [x] Task: Ensure backward compatibility for history items without CO-STAR data <!-- id: 6 --> [commit: 6578311]
- [x] Task: Conductor - User Manual Verification 'Phase 2: Frontend Workbench UI' (Protocol in workflow.md) <!-- id: 7 --> [commit: 6578311]

## Phase 3: Integration & Polish [checkpoint: 6578311]
- [x] Task: Update `PromptCard` to optionally show the breakdown or just the final prompt <!-- id: 8 --> [commit: 6578311]
- [x] Task: Add "Copy" buttons for individual sections <!-- id: 9 --> [commit: 6578311]
- [x] Task: Conductor - User Manual Verification 'Phase 3: Integration & Polish' (Protocol in workflow.md) <!-- id: 10 --> [commit: 6578311]
