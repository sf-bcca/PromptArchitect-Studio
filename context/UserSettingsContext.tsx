import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSettings, Theme } from '../types';
import { getUserSettings, saveUserSettings } from '../services/userSettings';
import { useSession } from './SessionProvider';
import { useNotifications } from './NotificationContext';

interface UserSettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useSession();
  const { notify } = useNotifications();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize from localStorage or default
  const [theme, setInternalTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('theme') as Theme;
        return saved || 'dark';
    }
    return 'dark';
  });

  const refreshSettings = useCallback(async () => {
    if (session?.user?.id) {
      setIsLoading(true);
      try {
        const data = await getUserSettings(session.user.id);
        if (data) {
          setSettings(data);
          setInternalTheme(data.theme);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('theme', data.theme);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user settings", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSettings(null);
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!session?.user?.id) return;

    try {
      const newSettings = await saveUserSettings({
        ...settings,
        ...updates,
        user_id: session.user.id,
      } as any);
      setSettings(newSettings);
      if (updates.theme) setInternalTheme(updates.theme);
      notify("Settings saved", "success");
    } catch (error) {
      console.error("Failed to save settings", error);
      notify("Failed to save settings", "error");
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setInternalTheme(newTheme);
    if (session?.user?.id) {
        await updateSettings({ theme: newTheme });
    }
  };

  return (
    <UserSettingsContext.Provider value={{ settings, isLoading, updateSettings, theme, setTheme }}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};
