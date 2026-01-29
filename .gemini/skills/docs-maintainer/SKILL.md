---
name: docs-maintainer
description: Audits project documentation. Checks for missing files in AGENTS.md and missing JSDoc on exported functions.
---

# Docs Maintainer

This skill helps maintain the high documentation standards of the PromptArchitect project.

## Capabilities

1.  **Audit Knowledge Base**: Checks if all source files in a directory are listed in its `AGENTS.md`.
2.  **Check JSDoc**: Scans for exported functions/components missing JSDoc comments.

## Usage

### Audit a Directory
Run this to check if `AGENTS.md` is up to date and if code is documented.

```bash
# Check Knowledge Base (AGENTS.md)
node .gemini/skills/docs-maintainer/scripts/audit_knowledge_base.cjs <directory>

# Check JSDoc
node .gemini/skills/docs-maintainer/scripts/check_jsdoc.cjs <directory>
```

### Example
To check the `components` directory:
```bash
node .gemini/skills/docs-maintainer/scripts/audit_knowledge_base.cjs components
node .gemini/skills/docs-maintainer/scripts/check_jsdoc.cjs components
```

## Workflow
1.  **Pre-Commit**: Run these checks before finishing a task to ensure "Definition of Done" criteria are met.
2.  **Fix**: If `audit_knowledge_base.cjs` fails, add the missing file to `AGENTS.md`.
3.  **Fix**: If `check_jsdoc.cjs` fails, add `/** ... */` comments to the flagged functions.