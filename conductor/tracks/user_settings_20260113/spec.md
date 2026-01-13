# Track Spec: User Settings & Personalization

## Overview
Enhance the user experience by allowing users to persist their preferences across sessions. This includes their preferred LLM model and interface settings like dark mode persistence.

## Objectives
- **Persistent Preferences:** Create a `user_settings` table in Supabase to store user-specific configuration.
- **Model Defaults:** Allow users to set a default LLM model (Gemini vs. Ollama) that is automatically selected on load.
- **UI Settings:** Persist theme preferences (Dark/Light mode) and sidebar state.
- **Settings Management:** Provide a UI panel for users to update these preferences.

## Scope
- **Schema:** New `user_settings` table with columns for `user_id`, `default_model`, `theme`, and `ui_state` (JSON).
- **Frontend:**
    - Create `useUserSettings` hook to fetch/update preferences.
    - Create `SettingsModal` or `SettingsSection` in the UI.
    - Update `App.tsx` to initialize state from `user_settings`.
- **Backward Compatibility:** Default to current hardcoded defaults if no settings exist.

## Success Criteria
- User selects a default model, refreshes, and the model remains selected.
- Theme preference is saved to the database and applied on login.
- No impact on performance during initial app load.
