# Track Spec: Prompt Versioning & Forking

## Overview
Enable users to iterate on their prompt architectures by creating new versions (forks) from existing history items. This transforms the linear history into a branching tree of experiments.

## Objectives
- **Data Structure:** Update `prompt_history` to support a `parent_id` field, establishing a lineage.
- **Forking Action:** Add a "Fork" or "Create Variation" button to the Workbench.
- **Versioning UI:** Display a "Version History" or "Lineage" view (simple list or tree) to navigate between related versions.
- **Context Preservation:** When forking, pre-fill the input with the original input (and potentially allow editing the granular components directly in the future, but for now, we iterate on the *Input*).

## Scope
- **Schema:** Add `parent_id` (UUID, nullable) to `prompt_history`.
- **Frontend:**
    - Update `PromptHistoryItem` type.
    - Add "Fork" button to `WorkbenchDisplay` / `PromptCard`.
    - Update `PromptForm` to handle "Editing" state where `parentId` is set.
    - Create a `VersionHistory` component to show children/parents.

## Success Criteria
- User can select a history item and click "Fork".
- The form populates with the original input.
- Submitting creates a new history item linked to the parent.
- User can see "Derived from X" or a list of versions.
