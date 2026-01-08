import { render, screen } from '@testing-library/react';
import Header from '../components/Header';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSession } from '../context/SessionProvider';

// Mock the usage of useSession
vi.mock('../context/SessionProvider', () => ({
    useSession: vi.fn(),
}));

describe('Header', () => {
    const mockSetShowAuth = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementation (logged out)
        vi.mocked(useSession).mockReturnValue({
            session: null,
            showAuth: false,
            setShowAuth: mockSetShowAuth,
        });
    });

    it('renders the header title correctly', () => {
        render(<Header />);
        const titleElement = screen.getByText(/PromptArchitect/i);
        expect(titleElement).toBeInTheDocument();
        const subtitle = screen.getByText(/Studio/i);
        expect(subtitle).toBeInTheDocument();
    });

    it('handles toggle sidebar click', () => {
        const onToggleSidebar = vi.fn();
        // Mock session for toggle button to appear
        vi.mocked(useSession).mockReturnValue({
            session: { user: { email: 'test@example.com' } } as any,
            showAuth: false,
            setShowAuth: mockSetShowAuth,
        });

        render(<Header onToggleSidebar={onToggleSidebar} />);
        const toggleBtn = screen.getByLabelText(/Toggle Menu/i);
        toggleBtn.click();
        expect(onToggleSidebar).toHaveBeenCalled();
    });
});
