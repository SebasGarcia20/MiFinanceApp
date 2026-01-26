'use client';

import { createContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { getTranslations, type Language, type Translations } from '@/lib/translations';

export interface LanguageContextValue {
  language: Language;
  translations: Translations;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { data: session } = useSession();
  const [language, setLanguageState] = useState<Language>('es');
  const [isLoading, setIsLoading] = useState(true);

  // Load language preference from API
  useEffect(() => {
    async function loadLanguage() {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          const lang = (data.language || 'es') as Language;
          setLanguageState(lang === 'en' ? 'en' : 'es');
        }
      } catch (error) {
        console.error('Error loading language:', error);
        // Default to Spanish
        setLanguageState('es');
      } finally {
        setIsLoading(false);
      }
    }

    loadLanguage();
  }, [session?.user?.id]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    
    // Save to API
    if (session?.user?.id) {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: lang }),
        });
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
  }, [session?.user?.id]);

  const translations = useMemo(() => getTranslations(language), [language]);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to Spanish if key not found
        const fallback = getTranslations('es');
        let fallbackValue: any = fallback;
        for (const fallbackKey of keys) {
          fallbackValue = fallbackValue?.[fallbackKey];
          if (fallbackValue === undefined) return key;
        }
        return typeof fallbackValue === 'string' ? fallbackValue : key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [translations]);

  const value = useMemo(
    () => ({ language, translations, t, setLanguage, isLoading }),
    [language, translations, t, setLanguage, isLoading]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
