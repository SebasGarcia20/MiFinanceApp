import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import Providers from '@/components/Providers';
import { LANGUAGE_COOKIE } from '@/components/LanguageProvider';

export const metadata: Metadata = {
  title: 'Flowly - Personal Finance Management',
  description: 'Track your money, effortlessly',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const initialLanguage = langCookie === 'en' ? 'en' : 'es';

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <body>
        <Providers initialLanguage={initialLanguage}>{children}</Providers>
      </body>
    </html>
  );
}
