# HOOKS KNOWLEDGE BASE

**Location:** `./hooks`
**Domain Score:** 8 (State and logic abstraction)

## OVERVIEW
Reusable React hooks for authentication, haptics, and prompt history state management.

## STRUCTURE
- `useAuth.ts`           # Supabase Auth session and loading state
- `useHaptics.ts`        # Mobile-ready tactile feedback wrapper
- `usePromptHistory.ts`  # Search, pagination, and persistence for prompt results

## WHERE TO LOOK
| Pattern | File | Description |
|---------|------|-------------|
| **History Logic** | `usePromptHistory.ts` | Implements debounced search filtering and pagination |
| **Auth State** | `useAuth.ts` | Handles `onAuthStateChange` from Supabase |
| **Feedback** | `useHaptics.ts` | Uses `vibrate` API with fallback for broad device support |

## CONVENTIONS
- **Prefix**: All hook filenames and exports must start with `use`.
- **Return Pattern**: Return an object `{ state, actions }` or a flat object for better destructuring.
- **Side Effects**: Use `useEffect` sparingly; favor derived state.
- **Dependencies**: Always include all external dependencies in `useCallback` and `useEffect` dependency arrays.

## ANTI-PATTERNS (HOOK-SPECIFIC)
- **NEVER** use `any` for hook return types; infer or define interfaces.
- **NEVER** put direct UI logic (e.g., `window.alert()`) in hooks; return a state or callback.
- **DO NOT** use complex logic inside a hook that isn't related to the hook's primary purpose.
- **DO NOT** include direct service calls if a dedicated service file exists; use the service.

## TESTING
- **Vitest**: Hooks are tested using `renderHook` from `@testing-library/react`.
- **Location**: Test files are located in `test/hooks/` (e.g., `usePromptHistory.test.ts`).
