const fs = require('fs');
const path = require('path');

const serviceName = process.argv[2];
const rootDir = process.cwd();
const servicesDir = path.join(rootDir, 'services');
const testsDir = path.join(rootDir, 'test', 'services');

if (!serviceName) {
  console.error("Error: Missing service name.");
  console.log("Usage: node scaffold_service_test.cjs <serviceName>");
  process.exit(1);
}

// Normalize name (e.g., 'userService' -> 'userService')
const safeName = serviceName.replace(/\.ts$/, '');
const testPath = path.join(testsDir, `${safeName}.test.ts`);

if (!fs.existsSync(testsDir)) {
  fs.mkdirSync(testsDir, { recursive: true });
}

if (fs.existsSync(testPath)) {
  console.error(`Error: Test file '${safeName}.test.ts' already exists.`);
  process.exit(1);
}

const template = `import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '../../services/supabaseClient';
import * as ${safeName} from '../../services/${safeName}';

// Mock the Supabase client
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
    })),
    functions: {
      invoke: vi.fn(),
    },
    auth: {
      getUser: vi.fn(),
    }
  }
}));

describe('${safeName} Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(${safeName}).toBeDefined();
  });

  // Example test: Replace with real function names
  // it('should fetch data successfully', async () => {
  //   const mockData = { id: 1, name: 'Test' };
  //   (supabase.from as any)().select().eq().single.mockResolvedValue({ data: mockData, error: null });
  //
  //   const result = await ${safeName}.someFunction();
  //   expect(result).toEqual(mockData);
  // });
});
`;

fs.writeFileSync(testPath, template);
console.log(`✅ Created Service Test: ${testPath}`);
console.log(`\nNext Steps:\n1. Open ${testPath}\n2. Update the imports to match the exported functions in 'services/${safeName}.ts'\n3. Implement tests using the pre-configured Supabase mocks.`);
