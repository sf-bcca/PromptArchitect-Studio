# Mocking Patterns

## Supabase Client

We use `vi.mock` to replace the singleton client from `@/services/supabaseClient`.

### Standard Mock Structure
```typescript
vi.mock('@/services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    functions: {
      invoke: vi.fn(),
    },
  }
}));
```

### Mocking Return Values
Use chained mocks to simulate database responses.

```typescript
// Success Case
(supabase.from as any)().select().eq().single.mockResolvedValue({ 
  data: { id: 1, name: 'Test' }, 
  error: null 
});

// Error Case
(supabase.from as any)().select().eq().single.mockResolvedValue({ 
  data: null, 
  error: { message: 'Not found' } 
});
```

## Edge Functions

When testing services that call Edge Functions, mock `functions.invoke`:

```typescript
(supabase.functions.invoke as any).mockResolvedValue({
  data: { refinedPrompt: "..." },
  error: null
});
```
