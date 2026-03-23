# CONTEXT KNOWLEDGE BASE

**Location:** `./context`
**Domain Score:** 10 (Global state management)

## OVERVIEW
Global React context providers for user preferences, notifications, and Supabase sessions.

## STRUCTURE
- `FavoritesContext.tsx`     # Local/Supabase sync for favorite prompts
- `NotificationContext.tsx`  # System-wide toast notifications
- `SessionProvider.tsx`      # Auth status and Supabase session holder
- `UserSettingsContext.tsx`  # User model and layout settings persistence

## WHERE TO LOOK
| Pattern | File | Description |
|---------|------|-------------|
| **Auth Session** | `SessionProvider.tsx` | Root-level listener for user logins |
| **Persistence** | `UserSettingsContext.tsx` | Syncs preferences with local storage and database |
| **Notifications** | `NotificationContext.tsx` | Custom UI with success/error states |

## CONVENTIONS
- **Provider Wrapping**: All providers are composed in `App.tsx`.
- **Custom Hooks**: Every context should provide a custom hook (e.g., `useSession()`) for consumption.
- **Provider Names**: Context providers should end in `Provider` or `Context`.
- **Memoization**: Always memoize values in the provider's `value` prop to prevent re-renders.

## ANTI-PATTERNS (CONTEXT-SPECIFIC)
- **NEVER** use context for high-frequency state updates; use local state or optimized hooks.
- **NEVER** put heavy business logic in a context provider; use `services/` or `hooks/`.
- **DO NOT** use `any` as the initial value for `createContext`.
- **DO NOT** forget to include children in the provider's props and usage.

## TESTING
- **Vitest**: Providers are tested using custom test wrappers in `test/` (e.g., `NotificationContext.test.tsx`).
- **Mocking**: Services (like Supabase client) should be mocked when testing providers.
