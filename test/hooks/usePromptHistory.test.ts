import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePromptHistory } from '../../hooks/usePromptHistory';
import { supabase } from '../../services/supabaseClient';

const mockRange = vi.fn();
const mockOrder = vi.fn(() => ({ range: mockRange }));
const mockSelect = vi.fn(() => ({ order: mockOrder }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    from: (table: string) => mockFrom(),
  },
}));

describe('usePromptHistory', () => {
  const mockSession = { user: { id: 'user1' } } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch history and include parentId', async () => {
    const mockData = [
      { id: '1', original_input: 'in1', result: {}, created_at: new Date().toISOString(), parent_id: 'parent1' }
    ];
    mockRange.mockResolvedValue({ data: mockData, error: null });

    const { result } = renderHook(() => usePromptHistory(mockSession));
    
    await act(async () => {
      await result.current.fetchHistory();
    });

    expect(result.current.history[0].parentId).toBe('parent1');
  });
});