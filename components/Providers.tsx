'use client';

import { SessionProvider } from 'next-auth/react';
import { SettingsProvider } from '@/components/SettingsProvider';
import { LanguageProvider } from '@/components/LanguageProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <LanguageProvider>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
