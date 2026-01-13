import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPanel from './SettingsPanel';
import { useUserSettings } from '../context/UserSettingsContext';

vi.mock('../context/UserSettingsContext', () => ({
  useUserSettings: vi.fn(),
}));

describe('SettingsPanel', () => {
  const mockUpdateSettings = vi.fn();
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUserSettings as any).mockReturnValue({
      settings: { default_model: 'llama3.2', theme: 'dark' },
      updateSettings: mockUpdateSettings,
      theme: 'dark',
      setTheme: mockSetTheme,
    });
  });

  it('renders correctly', () => {
    render(<SettingsPanel onClose={() => {}} />);
    expect(screen.getByText('Studio Settings')).toBeDefined();
    expect(screen.getByText('Appearance')).toBeDefined();
  });

  it('calls setTheme when theme button clicked', async () => {
    render(<SettingsPanel onClose={() => {}} />);
    const lightBtn = screen.getByText('Light');
    
    await act(async () => {
        fireEvent.click(lightBtn);
    });

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('calls updateSettings when model changed', async () => {
    render(<SettingsPanel onClose={() => {}} />);
    const select = screen.getByRole('combobox');
    
    await act(async () => {
        fireEvent.change(select, { target: { value: 'gemini-3.0-flash' } });
    });

    expect(mockUpdateSettings).toHaveBeenCalledWith({ default_model: 'gemini-3.0-flash' });
  });
});
