---
name: scaffold-flat
description: Generates React components and tests following the project's "Flat Structure" (no src/ folder). Use to ensure consistency.
---

# Scaffold Flat

This skill automates the creation of React components in this project's specific "Flat Structure."

## The Convention
- **No `src/` directory**: All code lives in root folders (`components/`, `hooks/`, etc.).
- **Co-located Tests**: Unit tests live *next to* the component (e.g., `Header.tsx` and `Header.test.tsx` are in the same folder), NOT in a separate `test/` folder.
- **Strict Typing**: All components use `React.FC<Props>` and defined interfaces.

## Usage

### Create a Component
This command generates the component file and its co-located test file.

```bash
node .gemini/skills/scaffold-flat/scripts/create_component.cjs <ComponentName>
```

### Example
To create a `UserProfile` component:
```bash
node .gemini/skills/scaffold-flat/scripts/create_component.cjs UserProfile
```

**Output:**
1. `components/UserProfile.tsx` (React 19 + Tailwind 4)
2. `components/UserProfile.test.tsx` (Vitest + Testing Library)

## Workflow
1. **Scaffold**: Run the command.
2. **Verify**: Run `pnpm test` to ensure the new test passes.
3. **Customize**: Edit the Props interface and implementation.