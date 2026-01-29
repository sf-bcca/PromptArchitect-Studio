---
name: test-suite-architect
description: Generates service-layer tests with correct Supabase mocking and provides guidance on testing patterns.
---

# Test Suite Architect

This skill simplifies the complex task of testing Supabase-integrated services.

## Capabilities

1.  **Scaffold Service Tests**: Generates a test file in `test/services/` for a given service, pre-configured with a comprehensive Supabase client mock.
2.  **Mocking Guidance**: Provides reference patterns for mocking fluent Supabase queries (`.from().select().eq()`).

## Usage

### Create a Service Test
Run this command to create a test file for an existing service.

```bash
node .gemini/skills/test-suite-architect/scripts/scaffold_service_test.cjs <serviceName>
```

### Example
To test `services/userService.ts`:
```bash
node .gemini/skills/test-suite-architect/scripts/scaffold_service_test.cjs userService
```

**Output:**
`test/services/userService.test.ts`

## Workflow
1.  **Scaffold**: Run the script.
2.  **Import**: Update the test file to import the specific functions you want to test from the service.
3.  **Mock**: Use the patterns in `references/mocking-patterns.md` to define the expected database responses.
4.  **Verify**: Run `pnpm test` to confirm.

## Reference
See [mocking-patterns.md](references/mocking-patterns.md) for detailed examples of how to mock complex Supabase queries.