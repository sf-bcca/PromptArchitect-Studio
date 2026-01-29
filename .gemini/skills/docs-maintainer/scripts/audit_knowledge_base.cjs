const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] || '.';
const rootDir = process.cwd();
const absoluteTargetDir = path.resolve(rootDir, targetDir);
const agentsPath = path.join(absoluteTargetDir, 'AGENTS.md');

if (!fs.existsSync(absoluteTargetDir)) {
  console.error(`Error: Directory '${targetDir}' does not exist.`);
  process.exit(1);
}

if (!fs.existsSync(agentsPath)) {
  console.log(`Info: No AGENTS.md found in '${targetDir}'. Skipping knowledge base audit.`);
  process.exit(0);
}

console.log(`🔍 Auditing Knowledge Base: ${path.relative(rootDir, agentsPath)}`);

const agentsContent = fs.readFileSync(agentsPath, 'utf8');
const files = fs.readdirSync(absoluteTargetDir).filter(f => {
  const ignoreList = [
    'node_modules', 'dist', 'test-results', 'package-lock.json', 
    'pnpm-lock.yaml', 'audit_report.json', 'metadata.json', '.git',
    'coverage', '.DS_Store', 'index.html', 'nginx.conf', 'ollama-init.sh',
    'playwright.config.ts', 'postcss.config.js', 'tailwind.config.ts',
    'tsconfig.json', 'vitest.config.ts'
  ];
  return !f.startsWith('.') && // Ignore hidden files
         f !== 'AGENTS.md' &&  // Ignore self
         !ignoreList.includes(f) &&
         !f.endsWith('.test.tsx') && // Ignore tests
         !f.endsWith('.test.ts') &&
         !f.endsWith('.spec.ts');
});

let issuesFound = 0;

// 1. Check for Missing Files (Code exists, but not in Docs)
const missingFiles = [];
files.forEach(file => {
  if (!agentsContent.includes(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n❌ Found ${missingFiles.length} files missing from AGENTS.md:`);
  missingFiles.forEach(f => console.log(`   - ${f}`));
  issuesFound++;
} else {
  console.log(`\n✅ All source files are referenced in AGENTS.md.`);
}

// 2. Check for Ghost Files (Docs exist, but Code is gone)
// Simple heuristic: Extract words that look like filenames from AGENTS.md structure section
// This is harder to do reliably without parsing, so we'll skip for this MVP version
// or just rely on the user to remove them.

if (issuesFound > 0) {
  console.log(`\nAction: Please update ${path.relative(rootDir, agentsPath)} to include the missing files.`);
  process.exit(1);
}
