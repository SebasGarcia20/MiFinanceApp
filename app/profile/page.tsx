'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import AppearanceModal from '@/components/AppearanceModal';
import LanguageModal from '@/components/LanguageModal';
import { useTranslation } from '@/hooks/useTranslation';

export default function ProfilePage() {
  const { t, language } = useTranslation();
  const { data: session, status } = useSession();
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  
  const languageNames: Record<string, string> = {
    es: 'Español',
    en: 'English',
  };
  
  // Get user data from session
  const name = session?.user?.name || 'User';
  const email = session?.user?.email || '';
  const userInitial = name.charAt(0).toUpperCase();
  const userImage = session?.user?.image;
  
  // Determine login method based on session
  const loginMethod = session?.user?.email?.includes('@gmail.com') ? 'Google' : 'Email';


  const handleDeleteAccount = () => {
    // TODO: Implement delete account with confirmation
    if (confirm(t('profile.areYouSure'))) {
      console.log('Delete account');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen bg-accent-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 min-h-screen py-4 px-4 pb-20 sm:px-6 sm:py-6 lg:py-8 lg:px-8 lg:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-accent-100 rounded-lg w-48"></div>
              <div className="h-32 bg-accent-100 rounded-lg"></div>
              <div className="h-64 bg-accent-100 rounded-lg"></div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-accent-50">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen py-4 px-4 pb-20 sm:px-6 sm:py-6 lg:py-8 lg:px-8 lg:pb-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="mb-6 animate-slide-down">
            <h1 className="text-4xl sm:text-5xl font-bold text-accent-900 mb-2">{t('profile.title')}</h1>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full"></div>
          </div>

          {/* User Header */}
          <div className="card mb-6">
            <div className="flex items-center gap-4">
              {userImage ? (
                <img
                  src={userImage}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-400 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                  {userInitial}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-accent-900 mb-1">{name}</h2>
                <p className="text-accent-600">{email}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="card mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-accent-900 mb-1">{t('profile.accountInformation')}</h2>
              <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  {t('profile.name')}
                </label>
                <div className="px-3 py-2 border border-transparent rounded-lg text-sm text-accent-900 bg-accent-50">
                  {name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  {t('profile.email')}
                </label>
                <div className="px-3 py-2 border border-transparent rounded-lg text-sm text-accent-900 bg-accent-50">
                  {email || t('profile.notAvailable')}
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="card mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-accent-900 mb-1">{t('profile.security')}</h2>
              <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  {t('profile.loginMethod')}
                </label>
                <div className="px-3 py-2 border border-transparent rounded-lg text-sm text-accent-900 bg-accent-50 flex items-center gap-2">
                  <span>{loginMethod}</span>
                  {loginMethod === 'Google' && (
                    <svg className="w-4 h-4" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                        fill="#4285F4"
                      />
                      <path
                        d="M9 18c2.43 0 4.467-.806 5.965-2.18l-2.908-2.258c-.806.54-1.837.86-3.057.86-2.35 0-4.34-1.587-5.053-3.72H.957v2.332C2.438 15.983 5.482 18 9 18z"
                        fill="#34A853"
                      />
                      <path
                        d="M3.947 10.702c-.18-.54-.282-1.117-.282-1.702 0-.585.102-1.162.282-1.702V4.966H.957C.348 6.175 0 7.55 0 9c0 1.45.348 2.825.957 4.034l2.99-2.332z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.966L3.947 7.3C4.66 5.163 6.65 3.58 9 3.58z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  {t('profile.password')}
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-3 py-2 border border-transparent rounded-lg text-sm text-accent-900 bg-accent-50">
                    ••••••••••••
                  </div>
                  <button className="btn-secondary text-sm">
                    {t('profile.changePassword')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-accent-900 mb-1">{t('profile.preferences')}</h2>
              <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  {t('profile.appearance')}
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-3 py-2 border border-transparent rounded-lg text-sm text-accent-900 bg-accent-50">
                    Light
                  </div>
                  <button
                    onClick={() => setIsAppearanceOpen(true)}
                    className="btn-secondary text-sm"
                  >
                    {t('profile.change')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-accent-700 mb-2">
                  {t('profile.language')}
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-3 py-2 border border-transparent rounded-lg text-sm text-accent-900 bg-accent-50">
                    {languageNames[language] || 'Español'}
                  </div>
                  <button
                    onClick={() => setIsLanguageOpen(true)}
                    className="btn-secondary text-sm"
                  >
                    {t('profile.change')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-200">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-red-600 mb-1">{t('profile.dangerZone')}</h2>
              <div className="h-0.5 w-12 bg-red-400 rounded-full"></div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="font-medium text-red-900 mb-1">{t('profile.signOut')}</div>
                  <div className="text-sm text-red-700">{t('profile.signOutDescription')}</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="btn-secondary text-sm border-red-200 text-red-700 hover:bg-red-100"
                >
                  {t('profile.signOut')}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="font-medium text-red-900 mb-1">{t('profile.deleteAccount')}</div>
                  <div className="text-sm text-red-700">{t('profile.deleteAccountDescription')}</div>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="btn-danger text-sm"
                >
                  {t('profile.deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AppearanceModal isOpen={isAppearanceOpen} onClose={() => setIsAppearanceOpen(false)} />
      <LanguageModal isOpen={isLanguageOpen} onClose={() => setIsLanguageOpen(false)} />

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}
