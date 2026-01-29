---
name: supabase-architect
description: Automates Supabase workflows including migrations, type synchronization, and schema security audits. Use when creating new database tables, updating schemas, or ensuring RLS compliance.
---

# Supabase Architect

This skill automates the database lifecycle and enforces security standards for Supabase.

## Capabilities

1.  **Create Migrations**: Generates timestamped migrations and provides next steps for type syncing.
2.  **Synchronize Types**: Regenerates TypeScript definitions from the local Supabase instance.
3.  **Audit Schema**: Scans migrations for missing Row Level Security (RLS) policies.

## Usage

### 1. Create a New Migration
Use this to create a new schema change file.
```bash
node .gemini/skills/supabase-architect/scripts/create_migration.cjs <migration_name>
```

### 2. Sync Types
Run this after applying migrations to update your TypeScript types.
```bash
node .gemini/skills/supabase-architect/scripts/sync_types.cjs
```

### 3. Audit Migrations
Run this to check for security anti-patterns like missing RLS.
```bash
node .gemini/skills/supabase-architect/scripts/audit_schema.cjs
```

## Reference
See [conventions.md](references/conventions.md) for project-specific SQL standards and RLS patterns.

## Workflow
1. **Plan**: Define the schema change in your task's `plan.md`.
2. **Create**: Run `create_migration.cjs`.
3. **Implement**: Add SQL to the generated file in `supabase/migrations/`.
4. **Audit**: Run `audit_schema.cjs` to verify RLS.
5. **Apply**: Run `npx supabase db reset` (local).
6. **Sync**: Run `sync_types.cjs` to update `types_db.ts`.