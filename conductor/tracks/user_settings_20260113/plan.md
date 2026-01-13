# Track Plan: User Settings & Personalization

## Phase 1: Database & API
- [x] Task: Create Supabase migration for `user_settings` table <!-- id: 0 --> [commit: a169b15]
- [ ] Task: Create `services/userSettings.ts` for database interactions
- [x] Task: Define `UserSettings` types in `types.ts` <!-- id: 2 --> [commit: c37a6d9]
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database & API' (Protocol in workflow.md)

## Phase 2: Application State Integration
- [ ] Task: Create `context/UserSettingsContext.tsx` to provide settings globally
- [ ] Task: Update `App.tsx` to load initial state from settings (model, theme)
- [ ] Task: Implement theme persistence logic (localStorage + DB sync)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Application State Integration' (Protocol in workflow.md)

## Phase 3: Settings UI
- [ ] Task: Create `SettingsPanel` component
- [ ] Task: Add a settings trigger (gear icon) to the `Header` or user profile area
- [ ] Task: Implement "Save Defaults" functionality
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Settings UI' (Protocol in workflow.md)
