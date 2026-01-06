import { render, screen } from '@testing-library/react';
import Header from '../components/Header';
import { describe, it, expect, vi } from 'vitest';

// Mock the usage of useSession
vi.mock('../context/SessionProvider', () => ({
    useSession: () => ({
        session: null,
        showAuth: false,
        setShowAuth: vi.fn(),
    }),
}));

describe('Header', () => {
    it('renders the header title correctly', () => {
        render(<Header onScrollToHistory={() => {}} />);
        const titleElement = screen.getByText(/PromptArchitect/i);
        expect(titleElement).toBeInTheDocument();
        const subtitle = screen.getByText(/Studio/i);
        expect(subtitle).toBeInTheDocument();
    });
});
