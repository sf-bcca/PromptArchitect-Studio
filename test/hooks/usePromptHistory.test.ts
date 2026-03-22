import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePromptHistory } from '../../hooks/usePromptHistory';
import { supabase } from '../../services/supabaseClient';

const mockBuilder: any = {
  select: vi.fn(() => mockBuilder),
  order: vi.fn(() => mockBuilder),
  range: vi.fn(() => mockBuilder),
  or: vi.fn(() => mockBuilder),
  delete: vi.fn(() => mockBuilder),
  eq: vi.fn(() => mockBuilder),
  not: vi.fn(() => mockBuilder),
  update: vi.fn(() => mockBuilder),
  then: vi.fn(), // Handle async/await
};

vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => mockBuilder),
  },
}));

describe('usePromptHistory', () => {
  const mockSession = { user: { id: 'user1' } } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: resolve with empty data
    mockBuilder.then.mockImplementation((onFulfilled: any) => 
      Promise.resolve(onFulfilled({ data: [], error: null }))
    );
  });

  it('should fetch history and include parentId', async () => {
    const mockData = [
      { id: '1', original_input: 'in1', result: {}, created_at: new Date().toISOString(), parent_id: 'parent1' }
    ];
    mockBuilder.then.mockImplementationOnce((onFulfilled: any) => 
      Promise.resolve(onFulfilled({ data: mockData, error: null }))
    );

    const { result } = renderHook(() => usePromptHistory(mockSession));
    
    await act(async () => {
      await result.current.fetchHistory();
    });

    expect(result.current.history[0].parentId).toBe('parent1');
  });

  it('should apply .or() filter when searchQuery is provided', async () => {
    const { result } = renderHook(() => usePromptHistory(mockSession));
    
    await act(async () => {
      await result.current.fetchHistory(0, 'test query');
    });

    expect(mockBuilder.or).toHaveBeenCalledWith(expect.stringContaining('test query'));
  });
});