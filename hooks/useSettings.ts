import { useSettingsContext } from '@/components/SettingsProvider';

// Re-export type for consumers (e.g. settings page)
export type { UserSettings } from '@/components/SettingsProvider';

/**
 * Shared settings hook. Uses SettingsProvider context so /api/settings
 * is fetched once per app, not per component.
 */
export function useSettings() {
  return useSettingsContext();
}
