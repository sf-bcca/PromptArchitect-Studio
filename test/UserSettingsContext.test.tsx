import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserSettingsProvider, useUserSettings } from '../context/UserSettingsContext';
import { useSession } from '../context/SessionProvider';
import { getUserSettings, saveUserSettings } from '../services/userSettings';

vi.mock('../context/SessionProvider', () => ({
  useSession: vi.fn(),
}));

vi.mock('../context/NotificationContext', () => ({
  useNotifications: () => ({ notify: vi.fn() }),
}));

vi.mock('../services/userSettings', () => ({
  getUserSettings: vi.fn(),
  saveUserSettings: vi.fn(),
}));

const TestComponent = () => {
  const { theme, setTheme } = useUserSettings();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  );
};

describe('UserSettingsContext', () => {
  const mockSession = { user: { id: 'u1' } };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSession as any).mockReturnValue({ session: mockSession });
  });

  it('loads settings on mount', async () => {
    (getUserSettings as any).mockResolvedValue({ theme: 'light' });

    await act(async () => {
      render(
        <UserSettingsProvider>
          <TestComponent />
        </UserSettingsProvider>
      );
    });

    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('updates theme and saves to DB', async () => {
    (getUserSettings as any).mockResolvedValue({ theme: 'dark', user_id: 'u1' });
    (saveUserSettings as any).mockResolvedValue({ theme: 'light', user_id: 'u1' });

    await act(async () => {
      render(
        <UserSettingsProvider>
          <TestComponent />
        </UserSettingsProvider>
      );
    });

    const button = screen.getByText('Set Light');
    await act(async () => {
      button.click();
    });

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(saveUserSettings).toHaveBeenCalledWith(expect.objectContaining({ theme: 'light' }));
  });
});
