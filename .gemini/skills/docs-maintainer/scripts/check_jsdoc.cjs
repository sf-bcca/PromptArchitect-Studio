const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] || '.';
const rootDir = process.cwd();
const absoluteTargetDir = path.resolve(rootDir, targetDir);

console.log(`🔍 Checking JSDoc in: ${path.relative(rootDir, absoluteTargetDir)}`);

const files = fs.readdirSync(absoluteTargetDir).filter(f => 
  (f.endsWith('.ts') || f.endsWith('.tsx')) && 
  !f.endsWith('.test.ts') && 
  !f.endsWith('.test.tsx') &&
  !f.endsWith('.d.ts')
);

let issuesFound = 0;

files.forEach(file => {
  const filePath = path.join(absoluteTargetDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Regex to find exported functions/consts
  // Matches: "export const myFunc =" or "export function myFunc"
  const exportRegex = /^\s*export\s+(const|function)\s+([a-zA-Z0-9_]+)/;

  lines.forEach((line, index) => {
    const match = line.match(exportRegex);
    if (match) {
      const funcName = match[2];
      
      // Check previous lines for JSDoc end "*/"
      let hasJSDoc = false;
      for (let i = index - 1; i >= 0; i--) {
        const prevLine = lines[i].trim();
        if (prevLine === '' || prevLine.startsWith('//')) continue; // Skip empty/comments
        if (prevLine.endsWith('*/')) {
          hasJSDoc = true;
        }
        break; // Only check the immediate predecessor block
      }

      // React components are often excluded from strict JSDoc if they are simple, 
      // but the rule says "all new functions". We'll flag it.
      if (!hasJSDoc) {
        console.log(`⚠️  Missing JSDoc: ${file} -> ${funcName}`);
        issuesFound++;
      }
    }
  });
});

if (issuesFound > 0) {
  console.log(`\n❌ Found ${issuesFound} missing JSDoc comments.`);
  process.exit(1);
} else {
  console.log(`\n✅ No missing JSDoc comments found.`);
}
