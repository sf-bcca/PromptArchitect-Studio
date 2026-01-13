import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserSettings, saveUserSettings } from '../../services/userSettings';
import { supabase } from '../../services/supabaseClient';
import { AppError } from '../../types';

// Mock Supabase
const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ single: mockSingle, eq: mockEq }));
const mockUpsert = vi.fn(() => ({ select: mockSelect }));

vi.mock('../../services/supabaseClient', async () => {
    const actual = await vi.importActual('../../services/supabaseClient');
    return {
        ...actual,
        supabase: {
            from: vi.fn(() => ({
                select: mockSelect,
                upsert: mockUpsert,
            })),
        },
    };
});

describe('userSettingsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return settings on successful fetch', async () => {
        const mockSettings = { user_id: 'u1', default_model: 'gpt4' };
        mockSingle.mockResolvedValue({ data: mockSettings, error: null });

        const result = await getUserSettings('u1');
        expect(result).toEqual(mockSettings);
    });

    it('should return null if no settings found (PGRST116)', async () => {
        mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'No rows' } });

        const result = await getUserSettings('u1');
        expect(result).toBeNull();
    });

    it('should throw AppError on other fetch failures', async () => {
        mockSingle.mockResolvedValue({ data: null, error: { code: 'OTHER', message: 'Fail' } });

        await expect(getUserSettings('u1')).rejects.toThrow(AppError);
    });

    it('should upsert and return settings', async () => {
        const mockSettings = { user_id: 'u1', theme: 'dark' };
        mockSingle.mockResolvedValue({ data: mockSettings, error: null });

        const result = await saveUserSettings(mockSettings as any);
        expect(result).toEqual(mockSettings);
        expect(mockUpsert).toHaveBeenCalledWith(mockSettings, { onConflict: 'user_id' });
    });
});
