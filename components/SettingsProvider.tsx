'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';

export interface UserSettings {
  periodStartDay: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  periodStartDay: 15,
};

interface SettingsContextValue {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    // Reset to defaults when user changes so we never show the previous account's settings
    setSettings(DEFAULT_SETTINGS);
    const ac = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch('/api/settings', { signal: ac.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load settings'))))
      .then((data) => {
        if (!ac.signal.aborted) {
          setSettings({ periodStartDay: data.periodStartDay });
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError' && !ac.signal.aborted) {
          console.error('Error loading settings:', err);
          setError('Failed to load settings');
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) setIsLoading(false);
      });

    return () => ac.abort();
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({ settings, isLoading, error }),
    [settings, isLoading, error]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }
  return ctx;
}
