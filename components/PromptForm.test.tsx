import { render, screen, fireEvent } from '@testing-library/react';
import PromptForm from './PromptForm';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('PromptForm', () => {
    const defaultProps = {
        userInput: '',
        setUserInput: vi.fn(),
        handleSubmit: vi.fn(),
        isLoading: false,
        selectedModel: 'gemini-3.1-flash-lite-preview',
        setSelectedModel: vi.fn(),
        models: [{ id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash-Lite', provider: 'gemini' }],
        isLocalAvailable: false,
        currentResult: null,
        session: null,
        setShowAuth: vi.fn(),
        onClear: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the textarea', () => {
        render(<PromptForm {...defaultProps} />);
        expect(screen.getByPlaceholderText(/Describe your task here/i)).toBeInTheDocument();
    });

    it('shows the clear button when userInput is not empty', () => {
        render(<PromptForm {...defaultProps} userInput="Hello" />);
        const clearBtn = screen.getByLabelText(/Clear input/i);
        expect(clearBtn).toBeInTheDocument();
    });

    it('does not show the clear button when userInput is empty', () => {
        render(<PromptForm {...defaultProps} userInput="" />);
        expect(screen.queryByLabelText(/Clear input/i)).not.toBeInTheDocument();
    });

    it('calls onClear when clear button is clicked', () => {
        render(<PromptForm {...defaultProps} userInput="Hello" />);
        const clearBtn = screen.getByLabelText(/Clear input/i);
        fireEvent.click(clearBtn);
        expect(defaultProps.onClear).toHaveBeenCalled();
    });
});
