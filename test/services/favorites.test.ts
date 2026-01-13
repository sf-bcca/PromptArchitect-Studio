import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFavorites } from '../../services/favorites';
import { supabase } from '../../services/supabaseClient';
import { AppError } from '../../types';

// Mock Supabase
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

vi.mock('../../services/supabaseClient', async () => {
    const actual = await vi.importActual('../../services/supabaseClient');
    return {
        ...actual,
        supabase: {
            from: vi.fn(() => ({
                select: mockSelect,
            })),
        },
    };
});

describe('favoritesService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
                order: mockOrder,
            })
        });
    });

    it('should throw AppError when getFavorites fails', async () => {
        mockOrder.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

        await expect(getFavorites('user1')).rejects.toThrow(AppError);
    });
});
