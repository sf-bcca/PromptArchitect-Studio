#!/usr/bin/env node
/**
 * @file audit_schema.cjs
 * @description Audits SQL migrations for security anti-patterns (e.g., missing RLS).
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(process.cwd(), 'supabase', 'migrations');

if (!fs.existsSync(MIGRATIONS_DIR)) {
  console.error(`Error: Migrations directory not found at ${MIGRATIONS_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));

console.log(`[SupabaseArchitect] Auditing ${files.length} migrations...`);

let issuesFound = 0;

files.forEach(file => {
  const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
  const lines = content.split('\n');
  
  // Rule 1: CREATE TABLE should have an ALTER TABLE ... ENABLE ROW LEVEL SECURITY
  const tablesCreated = lines
    .filter(line => line.toUpperCase().includes('CREATE TABLE'))
    .map(line => {
      const match = line.match(/CREATE TABLE ("?\w+"?\.)?"?(\w+)"?/i);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  tablesCreated.forEach(table => {
    const hasRLS = lines.some(line => 
      line.toUpperCase().includes(`ALTER TABLE`) && 
      line.toUpperCase().includes(table.toUpperCase()) && 
      line.toUpperCase().includes('ENABLE ROW LEVEL SECURITY')
    );

    if (!hasRLS) {
      console.warn(`⚠️  [${file}] Table "${table}" created but RLS not enabled.`);
      issuesFound++;
    }
  });
});

if (issuesFound === 0) {
  console.log('✅ No obvious security anti-patterns found in migrations.');
} else {
  console.log(`\n❌ Found ${issuesFound} potential issues.`);
}
