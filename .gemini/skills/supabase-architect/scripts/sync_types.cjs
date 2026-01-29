#!/usr/bin/env node
/**
 * @file sync_types.cjs
 * @description Generates TypeScript types from the local Supabase instance.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'types_db.ts';

try {
  console.log('[SupabaseArchitect] Synchronizing types from local database...');
  
  // Generate types using Supabase CLI
  // We assume local development environment is running
  const cmd = `npx supabase gen types typescript --local > ${OUTPUT_FILE}`;
  execSync(cmd, { stdio: 'inherit' });

  console.log(`\n✅ Types synchronized to ${OUTPUT_FILE}`);
  
  // Check if file exists and has content
  if (fs.existsSync(OUTPUT_FILE)) {
    const stats = fs.statSync(OUTPUT_FILE);
    if (stats.size === 0) {
      console.warn('⚠️ Warning: Generated type file is empty. Is your local Supabase instance running?');
    }
  }

} catch (error) {
  console.error(`Error synchronizing types: ${error.message}`);
  console.log('\n💡 Tip: Ensure Supabase is running with `npx supabase start`.');
  process.exit(1);
}
