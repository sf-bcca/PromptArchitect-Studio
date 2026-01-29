---
name: conductor-helper
description: Automates the PromptArchitect Conductor workflow. Use for starting/finishing tasks, managing tracks, and phase checkpoints.
---

# Conductor Helper

This skill automates the rigorous "Conductor" workflow required by this project.

## Capabilities

1.  **Manage Tracks**: Create and list development tracks.
2.  **Task Lifecycle**: Start and finish tasks in `plan.md` with correct formatting.
3.  **Checkpoints**: Automate phase verification and checkpointing.

## Rules
See [workflow-rules.md](references/workflow-rules.md) for the "Ten Commandments" of this workflow.

## Scripts

### 1. Manage Tracks
Use this to create new feature tracks or list existing ones.
```bash
node .gemini/skills/conductor-helper/scripts/manage_track.cjs create <track_name>
node .gemini/skills/conductor-helper/scripts/manage_track.cjs list
```

### 2. Update Task Status
Use this to mechanically update the `plan.md` file.
**Arguments:**
- `start`: Marks task `[~]`.
- `finish`: Marks task `[x]` and appends SHA.
- `checkpoint`: Marks phase header with SHA.

```bash
# Start a task
node .gemini/skills/conductor-helper/scripts/update_task.cjs start <path_to_plan.md> "Task Name"

# Finish a task (after commit)
node .gemini/skills/conductor-helper/scripts/update_task.cjs finish <path_to_plan.md> "Task Name" <commit_sha>

# Checkpoint a phase
node .gemini/skills/conductor-helper/scripts/update_task.cjs checkpoint <path_to_plan.md> "Phase Name" <commit_sha>
```

## Workflow Guide

### A. Starting a New Feature
1.  Run `manage_track.cjs list` to see if a relevant track exists.
2.  If not, `manage_track.cjs create "feature-name"`.
3.  Read the new `plan.md` and `spec.md` to understand the scope.

### B. Working on a Task
1.  **Select**: Pick the next `[ ]` task.
2.  **Start**: Run `update_task.cjs start ...`.
3.  **TDD**: Create a test file, run it (red), implement (green).
4.  **Commit**: `git commit -m "feat(...): ..."`
5.  **Note**: `git notes add -m "Task Summary..." <sha>`
6.  **Finish**: Run `update_task.cjs finish ...`.

### C. Checkpointing a Phase
1.  **Verify**: Run all tests.
2.  **Manual Plan**: Propose manual verification steps to user.
3.  **Commit**: `git commit -allow-empty -m "conductor(checkpoint): ..."`
4.  **Note**: Attach verification report.
5.  **Mark**: Run `update_task.cjs checkpoint ...`.