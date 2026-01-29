# SERVICE LAYER KNOWLEDGE BASE

**Location:** `./services`
**Domain Score:** 12 (Distinct API/Logic Domain)

## OVERVIEW
Centralized service layer for Supabase Edge Functions, database interactions, and external AI engine integrations.

## STRUCTURE
- `supabaseClient.ts`       # Singleton Supabase client configuration
- `geminiService.ts`        # Secure invocation of 'engineer-prompt' Edge Function
- `favorites.ts`            # CRUD operations for user prompt persistence
- `userSettings.ts`         # Management of user preferences and model config

## WHERE TO LOOK
| Pattern | File | Description |
|---------|------|-------------|
| **Edge Functions** | `geminiService.ts` | Uses `supabase.functions.invoke` to bypass client-side LLM calls |
| **Relational Joins** | `favorites.ts` | Complex `.select()` strings with nested object mapping |
| **Data Mapping** | `favorites.ts`, `userSettings.ts` | Snake_case (DB) to camelCase (Frontend) transformation |
| **Error Handling** | `geminiService.ts` | Explicit re-throwing of Edge Function errors with messages |
| **User State** | `userSettings.ts` | Persists layout and model preferences |

## CONVENTIONS
- **Shared Client**: Always import `supabase` from `./supabaseClient.ts`.
- **Strict Typing**: All service functions must return `Promise<T>` where T is defined in `types.ts`.
- **Async Pattern**: Every function is `export const name = async (...) => { ... }`.
- **Transformation**: Services are responsible for converting database DTOs to Application Entities.
- **Logging**: Use service-specific prefixes like `[FavoritesService]` for production observability.
- **Environment**: Client initialization requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## ANTI-PATTERNS (SERVICE-SPECIFIC)
- **NEVER** instantiate `createClient` inside individual service files; use the shared instance.
- **NEVER** include business logic that belongs in the Edge Function (e.g., prompt templates).
- **NEVER** use `any` for database response types; cast or define appropriate interfaces.
- **NEVER** expose raw database error objects to the UI; wrap in user-friendly `Error` messages.
- **DO NOT** perform direct AI provider calls (Gemini/Ollama) from the frontend; use the Edge Function proxy.
- **DO NOT** include UI-specific logic (e.g., `alert()`, `setLoading`) in this layer.

## SUPABASE INTEGRATION PATTERNS
- **Security**: The client uses the **Anonymous Key**, relying on Row Level Security (RLS) defined in `supabase/migrations`.
- **Edge Function Proxying**: Sensitive keys (Gemini API Key) are stored in Supabase Secrets and never touch the client.
- **PostgREST Builder**: Favor the fluent API (`.from().select().eq()`) over raw RPC calls where possible.
