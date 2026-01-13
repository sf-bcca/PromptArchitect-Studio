import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { engineerPrompt } from '../../services/geminiService';
import { supabase } from '../../services/supabaseClient';
import { AppError, ErrorCode } from '../../types';

// Mock Supabase client
vi.mock('../../services/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return data on successful invocation', async () => {
    const mockData = { refinedPrompt: 'Success' };
    (supabase.functions.invoke as any).mockResolvedValue({ data: mockData, error: null });

    const result = await engineerPrompt('test input');
    expect(result).toEqual(mockData);
  });

  it('should throw AppError with LLM_GENERATION_FAILED on function error', async () => {
    const mockError = { message: 'Function error' };
    (supabase.functions.invoke as any).mockResolvedValue({ data: null, error: mockError });

    await expect(engineerPrompt('test input')).rejects.toThrow(AppError);
    
    try {
        await engineerPrompt('test input');
    } catch (e: any) {
        expect(e.code).toBe(ErrorCode.LLM_GENERATION_FAILED);
    }
  });

  it('should throw AppError with NETWORK_ERROR on unexpected error', async () => {
     (supabase.functions.invoke as any).mockRejectedValue(new Error('Network fail'));

     const promise = engineerPrompt('test input');
     promise.catch(() => {}); // Prevent unhandled rejection warning
     
     // Advance time to exhaust retries
     await vi.runAllTimersAsync();
     
     try {
        await promise;
        expect.fail('Should have thrown');
     } catch (e: any) {
         expect(e).toBeInstanceOf(AppError);
         expect(e.code).toBe(ErrorCode.NETWORK_ERROR);
     }
  });

  it('should retry on temporary network failure', async () => {
      // Fail twice, then succeed
      (supabase.functions.invoke as any)
        .mockRejectedValueOnce(new Error('Network fail 1'))
        .mockRejectedValueOnce(new Error('Network fail 2'))
        .mockResolvedValue({ data: { refinedPrompt: 'Success' }, error: null });

      const promise = engineerPrompt('test input');
      promise.catch(() => {}); // Prevent unhandled rejection warning
      
      await vi.runAllTimersAsync();
      const result = await promise;
      
      expect(result).toEqual({ refinedPrompt: 'Success' });
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(3);
  });

  it('should give up after max retries', async () => {
      (supabase.functions.invoke as any).mockRejectedValue(new Error('Persistent fail'));

      const promise = engineerPrompt('test input');
      promise.catch(() => {}); // Prevent unhandled rejection warning

      await vi.runAllTimersAsync();

      try {
        await promise;
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e).toBeInstanceOf(AppError);
        expect(supabase.functions.invoke).toHaveBeenCalledTimes(4); // Initial + 3 retries
      }
  });

  it('should throw AppError with specific errorCode from function response', async () => {
    // Simulate a structured error response from Supabase Function
    const mockError = { 
        message: 'Invalid provider',
        status: 400
    };
    // If the body is also available, we'd need to mock how invoke returns it.
    // Usually Supabase functions returns the body in the error if it's not a 2xx.
    (supabase.functions.invoke as any).mockResolvedValue({ 
        data: null, 
        error: mockError 
    });

    try {
        await engineerPrompt('test input');
        expect.fail('Should have thrown');
    } catch (e: any) {
        expect(e).toBeInstanceOf(AppError);
    }
  });
});
