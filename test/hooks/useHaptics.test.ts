import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHaptics } from '../../hooks/useHaptics';

describe('useHaptics', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      vibrate: vi.fn(),
    });
  });

  it('calls vibrate with a light impact pattern', () => {
    const { result } = renderHook(() => useHaptics());
    result.current.lightImpact();
    expect(navigator.vibrate).toHaveBeenCalledWith(10);
  });

  it('calls vibrate with an error impact pattern', () => {
    const { result } = renderHook(() => useHaptics());
    result.current.errorImpact();
    expect(navigator.vibrate).toHaveBeenCalledWith([50, 50, 50]);
  });
});
