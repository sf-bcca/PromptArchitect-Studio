# Conductor Workflow Rules (Summary)

1. **Source of Truth**: `plan.md` controls everything. Update it *before* work (Start) and *after* work (Finish).
2. **Tech Stack**: Document changes in `tech-stack.md` *before* implementation.
3. **TDD**: Write failing tests (Red) -> Implement (Green) -> Refactor.
4. **Task Lifecycle**:
   - **Start**: Update `plan.md` to `[~]`.
   - **Work**: TDD loop.
   - **Commit**: `git commit -m "type(scope): description"`.
   - **Note**: `git notes add -m "Task Summary..." <hash>`.
   - **Finish**: Update `plan.md` to `[x] <sha>`.
5. **Phase Checkpoint**:
   - Verify all tests pass.
   - Manual verification plan + User confirmation.
   - Commit: `conductor(checkpoint): Checkpoint end of Phase X`.
   - Note: Attach verification report to checkpoint commit.
   - Update `plan.md` header with `[checkpoint: <sha>]`.
