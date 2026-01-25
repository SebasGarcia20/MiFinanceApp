'use client';

import { SessionProvider } from 'next-auth/react';
import { SettingsProvider } from '@/components/SettingsProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </SessionProvider>
  );
}
