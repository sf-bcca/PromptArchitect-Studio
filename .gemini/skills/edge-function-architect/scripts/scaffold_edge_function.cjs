const fs = require('fs');
const path = require('path');

const functionName = process.argv[2];
const rootDir = process.cwd();
const functionsDir = path.join(rootDir, 'supabase', 'functions');
const testsDir = path.join(rootDir, 'test');

if (!functionName) {
  console.error("Error: Missing function name.");
  console.log("Usage: node scaffold_edge_function.cjs <function-name>");
  process.exit(1);
}

// 1. Setup Paths
const funcDir = path.join(functionsDir, functionName);
const funcFile = path.join(funcDir, 'index.ts');
const testFile = path.join(testsDir, `${functionName}-logic.test.ts`);

if (fs.existsSync(funcDir)) {
  console.error(`Error: Function '${functionName}' already exists.`);
  process.exit(1);
}

// 2. Create Directories
fs.mkdirSync(funcDir, { recursive: true });

// 3. Define Templates
// Deno Template (Backend)
const denoTemplate = `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { corsHeaders } from "../_shared/cors.ts"; // Assuming shared CORS, otherwise inline

console.log("Hello from Function: ${functionName}");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name } = await req.json();
    
    // --- MIRRORED LOGIC START ---
    // Validation Logic (Must match test/${functionName}-logic.test.ts)
    if (!name) throw new Error("Missing name");
    if (name.length > 50) throw new Error("Name too long");
    // --- MIRRORED LOGIC END ---

    const data = { message: 	Hello ${name}!	 };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
`;

// Vitest Template (Mirrored Logic)
const testTemplate = `import { describe, it, expect } from 'vitest';

/**
 * MIRRORED LOGIC TEST
 * This file duplicates the validation logic found in:
 * supabase/functions/${functionName}/index.ts
 * 
 * Purpose: Ensure Node.js environment expectations match Deno runtime logic.
 */

describe('${functionName} Edge Function Logic', () => {

  // --- MIRRORED LOGIC START ---
  // Re-implemented validation for testing purposes
  const validateInput = (input: any) => {
    if (!input?.name) throw new Error("Missing name");
    if (input.name.length > 50) throw new Error("Name too long");
    return true;
  };
  // --- MIRRORED LOGIC END ---

  it('should validate successfully with correct input', () => {
    expect(() => validateInput({ name: "Gemini" })).not.toThrow();
  });

  it('should fail when name is missing', () => {
    expect(() => validateInput({})).toThrow("Missing name");
  });

  it('should fail when name is too long', () => {
    const longName = "a".repeat(51);
    expect(() => validateInput({ name: longName })).toThrow("Name too long");
  });
});
`;

// 4. Write Files
fs.writeFileSync(funcFile, denoTemplate);
fs.writeFileSync(testFile, testTemplate);

console.log("✅ Created Edge Function: ${funcFile}");
console.log("✅ Created Mirrored Test: ${testFile}");
console.log(`\nNext Steps:\n1. Run 'pnpm test' to verify the new test passes.\n2. Implement your logic in BOTH files to keep them in sync.`);
