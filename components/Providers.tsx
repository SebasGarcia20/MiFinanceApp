'use client';

import { SessionProvider } from 'next-auth/react';
import { SettingsProvider } from '@/components/SettingsProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import ToastProvider from '@/components/ToastProvider';
import type { Language } from '@/lib/translations';

interface ProvidersProps {
  children: React.ReactNode;
  initialLanguage?: Language;
}

export default function Providers({ children, initialLanguage }: ProvidersProps) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <LanguageProvider initialLanguage={initialLanguage}>
        <ToastProvider>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </ToastProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
