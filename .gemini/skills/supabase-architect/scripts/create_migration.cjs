#!/usr/bin/env node
/**
 * @file create_migration.cjs
 * @description Automates Supabase migration creation and triggers type sync.
 */

const { execSync } = require('child_process');
const path = require('path');

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Error: Please provide a migration name.');
  process.exit(1);
}

try {
  console.log(`[SupabaseArchitect] Creating migration: ${migrationName}...`);
  
  // 1. Create the migration using Supabase CLI
  const createOutput = execSync(`npx supabase migrations new ${migrationName}`, { encoding: 'utf8' });
  console.log(createOutput.trim());

  // 2. Remind user to sync types after applying
  console.log('\n✅ Migration file created.');
  console.log('👉 Next Steps:');
  console.log('1. Add your SQL to the new migration file.');
  console.log('2. Run `npx supabase db reset` to apply changes.');
  console.log('3. Run `node .gemini/skills/supabase-architect/scripts/sync_types.cjs` to update TypeScript types.');
  
} catch (error) {
  console.error(`Error creating migration: ${error.message}`);
  process.exit(1);
}

