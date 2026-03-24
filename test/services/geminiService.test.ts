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
    vi.unstubAllGlobals();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return data when engineerPrompt is successful', async () => {
    const mockData = { refinedPrompt: 'Engineered prompt' };
    (supabase.functions.invoke as any).mockResolvedValue({ data: mockData, error: null });

    const result = await engineerPrompt('test input');
    expect(result).toEqual(mockData);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('engineer-prompt', {
      body: { userInput: 'test input', model: undefined, parentId: undefined },
    });
  });

  it('should throw AppError when engineer-prompt edge function fails after retries', async () => {
    const mockError = { message: 'Function error' };
    (supabase.functions.invoke as any).mockResolvedValue({ data: null, error: mockError });

    const promise = engineerPrompt('test input');
    const rejectsPromise = expect(promise).rejects.toThrow(AppError);
    
    // Fast-forward through all retries
    for (let i = 0; i < 3; i++) {
        await vi.advanceTimersByTimeAsync(10000); 
    }

    await rejectsPromise;
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(4);
  });

  it('should retry on LLM_SERVICE_UNAVAILABLE error', async () => {
      const mockError = { message: '503 Service Unavailable' };
      const mockData = { refinedPrompt: 'Success after retry' };
      
      (supabase.functions.invoke as any)
          .mockResolvedValueOnce({ data: null, error: mockError })
          .mockResolvedValueOnce({ data: mockData, error: null });

      const promise = engineerPrompt('test input');
      
      // Advance time to trigger retry
      await vi.advanceTimersByTimeAsync(2000);
      
      const result = await promise;
      expect(result).toEqual(mockData);
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
  });

  describe('Local Gemma Routing', () => {
    it('should route to localhost when provider is gemma-local', async () => {
      const mockLocalResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              refinedPrompt: 'Local Success',
              whyThisWorks: 'Local logic',
              suggestedVariables: [],
              costar: { context: '', objective: '', style: '', tone: '', audience: '', response: '' }
            })
          }
        }]
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockLocalResponse
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await engineerPrompt('test input', 'gemma-local', 'gemma-local');
      
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(':8080/v1/chat/completions'), expect.objectContaining({
          signal: expect.any(AbortSignal),
          method: 'POST'
      }));
      expect(result.refinedPrompt).toBe('Local Success');
      expect(result.provider).toBe('gemma-local');
    });

    it('should throw LLM_SERVICE_UNAVAILABLE if local fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

      await expect(engineerPrompt('test input', 'gemma-local', 'gemma-local')).rejects.toThrow(AppError);
    });

    it('should throw error if local response contains invalid JSON', async () => {
        const mockInvalidResponse = {
            choices: [{
                message: {
                    content: 'Not valid JSON'
                }
            }]
        };

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockInvalidResponse
        }));

        await expect(engineerPrompt('test input', 'gemma-local', 'gemma-local')).rejects.toThrow(/invalid JSON format/);
    });
  });

  it('should provide better messaging for 503 errors', async () => {
    const mockError = { message: '503 Service Unavailable' };
    (supabase.functions.invoke as any).mockResolvedValue({ data: null, error: mockError });

    const promise = engineerPrompt('test input', 'gemini-3.1-flash-lite-preview');
    const rejectsPromise = expect(promise).rejects.toThrow();
    
    // Fast-forward through all retries
    for (let i = 0; i < 3; i++) {
        await vi.advanceTimersByTimeAsync(10000);
    }

    try {
        await rejectsPromise;
        await promise;
        expect.fail('Should have thrown');
    } catch (e: any) {
        expect(e.code).toBe(ErrorCode.LLM_SERVICE_UNAVAILABLE);
        expect(e.message).toContain('currently experiencing high demand');
    }
  });
});
