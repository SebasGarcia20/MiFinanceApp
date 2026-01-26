import { useContext } from 'react';
import { LanguageContext } from '@/components/LanguageProvider';
import type { LanguageContextValue } from '@/components/LanguageProvider';
import { getTranslations, type Language, type Translations } from '@/lib/translations';

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  
  if (!context) {
    // Fallback to Spanish if context not available
    return {
      t: (key: string) => {
        const keys = key.split('.');
        let value: any = getTranslations('es');
        for (const k of keys) {
          value = value?.[k];
          if (value === undefined) return key;
        }
        return typeof value === 'string' ? value : key;
      },
      language: 'es' as Language,
      translations: getTranslations('es'),
      setLanguage: async () => {},
      isLoading: false,
    };
  }

  return context;
}
