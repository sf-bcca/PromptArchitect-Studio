import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorkbenchDisplay from './WorkbenchDisplay';
import { RefinedPromptResult } from '../types';

// Mock Notifications Context
vi.mock('../context/NotificationContext', () => ({
  useNotifications: () => ({
    notify: vi.fn(),
  })
}));

// Mock Favorites Context to avoid provider wrapping
vi.mock('../context/FavoritesContext', () => ({
  useFavorites: () => ({
    isFavorite: () => false,
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
  })
}));

describe('WorkbenchDisplay', () => {
  const granularResult: RefinedPromptResult = {
    refinedPrompt: "Full prompt text",
    whyThisWorks: "Because...",
    suggestedVariables: [],
    costar: {
        context: "Ctx",
        objective: "Obj",
        style: "Sty",
        tone: "Tne",
        audience: "Aud",
        response: "Res"
    }
  };

  it('renders workbench tabs', () => {
    render(<WorkbenchDisplay result={granularResult} />);
    expect(screen.getByText('Workbench')).toBeDefined();
    expect(screen.getByText('Preview')).toBeDefined();
  });

  it('defaults to workbench view showing sections', () => {
    render(<WorkbenchDisplay result={granularResult} />);
    // Use getAllByText because both mobile and desktop views render it
    expect(screen.getAllByText('Ctx').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Obj').length).toBeGreaterThan(0);
  });

  it('switches to preview view', () => {
    render(<WorkbenchDisplay result={granularResult} />);
    const previewBtn = screen.getByText('Preview');
    fireEvent.click(previewBtn);
    expect(screen.getByText('Full prompt text')).toBeDefined();
  });
});
