# Track Spec: Mobile Polish & PWA

## Overview
Optimize PromptArchitect-Studio for a native-like mobile experience. This includes making the app installable via PWA and refining the UI for small touchscreens.

## Objectives
- **PWA Integration:** Add a `manifest.json` and service worker to support "Add to Home Screen".
- **Mobile Responsive UI:**
    - Update `WorkbenchDisplay` to use a tabbed interface on mobile instead of a grid.
    - Ensure all buttons have a minimum touch target size of 44x44px.
- **Enhanced Feedback:** Add haptic feedback (vibration) for key actions on mobile devices.
- **Visual Polish:** Add a splash screen and correct app icons for iOS/Android.

## Scope
- **Assets:** Create/update icons in `public/`.
- **Public Folder:** Create `manifest.json`.
- **Frontend Components:**
    - `WorkbenchDisplay`: Responsive layout logic.
    - `Header`: Mobile navigation tweaks.
    - `hooks/useHaptics.ts`: New hook for vibration.

## Success Criteria
- Lighthouse "PWA" score > 90.
- App feels "native" when added to the home screen (no URL bar).
- Workbench is easily readable and navigable on a standard smartphone screen.
