import { describe, it, expect } from 'vitest';
import { handleSupabaseError } from '../../services/supabaseClient';
import { AppError, ErrorCode } from '../../types';

describe('handleSupabaseError', () => {
    it('should throw AppError wrapping the original error', () => {
        const originalError = { message: 'DB fail', code: 'PGRST100', details: '', hint: '' };
        
        try {
            handleSupabaseError(originalError, 'test_context');
            expect.fail('Should have thrown');
        } catch (e: any) {
            expect(e).toBeInstanceOf(AppError);
            expect(e.code).toBe(ErrorCode.NETWORK_ERROR);
            expect(e.message).toContain('DB fail');
            expect(e.details).toEqual({ originalError });
        }
    });
});
