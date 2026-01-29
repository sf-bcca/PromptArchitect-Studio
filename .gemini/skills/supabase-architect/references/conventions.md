# Supabase Conventions

## Database Naming
- **Tables**: snake_case, plural (e.g., `prompt_history`, `user_settings`).
- **Columns**: snake_case (e.g., `created_at`, `user_id`).
- **Primary Keys**: Always `id uuid default gen_random_uuid() primary key`.

## Security (RLS)
Every table **MUST** have Row Level Security enabled.

### Standard "Owner Only" Pattern
```sql
alter table public.my_table enable row level security;

create policy "Users can only access their own data"
on public.my_table
for all
using (auth.uid() = user_id);
```

## Anti-Patterns
- **NEVER** use `serial` or `integer` for IDs; use `uuid`.
- **NEVER** store PII without a clear business justification.
- **NEVER** use `public` schema for internal utility functions.

## Type Synchronization
After any schema change:
1. `npx supabase db reset` (applies all migrations)
2. `node .gemini/skills/supabase-architect/scripts/sync_types.cjs`
3. Verify `types_db.ts` is updated.
