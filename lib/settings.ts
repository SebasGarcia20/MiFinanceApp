/**
 * Settings management for global app configuration
 */

const SETTINGS_KEY = 'appSettings';

export interface AppSettings {
  periodStartDay: number; // Day of month when period starts (1-31)
}

const DEFAULT_SETTINGS: AppSettings = {
  periodStartDay: 1, // Default to standard calendar month
};

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  
  try {
    const parsed = JSON.parse(stored) as AppSettings;
    // Validate periodStartDay
    if (parsed.periodStartDay < 1 || parsed.periodStartDay > 31) {
      return DEFAULT_SETTINGS;
    }
    return parsed;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function updateSettings(updates: Partial<AppSettings>): void {
  const current = loadSettings();
  saveSettings({ ...current, ...updates });
}
