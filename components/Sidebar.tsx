'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import FlowlyMark from './FlowlyMark';
import AppearanceModal from './AppearanceModal';
import LanguageModal from './LanguageModal';
import { useTranslation } from '@/hooks/useTranslation';

export default function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isOverview = pathname === '/';
  const isBuckets = pathname === '/buckets';
  const isSavings = pathname === '/savings';
  const isInsights = pathname === '/insights';
  const isSettings = pathname === '/settings';

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r-2 border-accent-200 shadow-soft-lg z-40 flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b-2 border-accent-100">
        <Link href="/" className="flex items-center gap-3 group transition-opacity hover:opacity-90">
          <FlowlyMark size={40} className="text-primary-500 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl font-extrabold text-accent-900 leading-tight" style={{ letterSpacing: '0.015em' }}>
              Flowly
            </h1>
            <div className="h-0.5 w-10 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full mt-0.5"></div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <SidebarItem
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          label={t('nav.overview')}
          href="/"
          isActive={isOverview}
        />
        <SidebarItem
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          label={t('nav.buckets')}
          href="/buckets"
          isActive={isBuckets}
        />
        <SidebarItem
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label={t('nav.savings')}
          href="/savings"
          isActive={isSavings}
        />
        <SidebarItem
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          label={t('nav.insights')}
          href="/insights"
          isActive={isInsights}
        />
        <SidebarItem
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label={t('nav.settings')}
          href="/settings"
          isActive={isSettings}
        />
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t-2 border-accent-100">
        <ProfileSection />
      </div>
    </aside>
  );
}

function ProfileSection() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { data: session } = useSession();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Get user data from session
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent-50 transition-all duration-200 group"
      >
        {userImage ? (
          <img
            src={userImage}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {userInitial}
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-medium text-accent-900 truncate">{userName}</div>
          {userEmail && (
            <div className="text-xs text-accent-500 truncate">{userEmail}</div>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-accent-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-soft-lg border border-accent-200 overflow-hidden animate-scale-in"
          style={{ animationDuration: '150ms' }}
        >
          <div className="py-1">
            <PopoverMenuItem
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              label={t('nav.profile')}
              onClick={() => {
                setIsOpen(false);
                router.push('/profile');
              }}
            />
            <div className="border-t border-accent-100 my-1"></div>
            <PopoverMenuItem
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              }
              label={t('profile.preferences')}
              onClick={() => {
                setIsOpen(false);
                router.push('/profile');
              }}
            />
            <PopoverMenuItem
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              }
              label={t('profile.signOut')}
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: '/login' });
              }}
              isDestructive
            />
          </div>
        </div>
      )}

      <AppearanceModal isOpen={isAppearanceOpen} onClose={() => setIsAppearanceOpen(false)} />
      <LanguageModal isOpen={isLanguageOpen} onClose={() => setIsLanguageOpen(false)} />
    </div>
  );
}

interface PopoverMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isDestructive?: boolean;
}

function PopoverMenuItem({ icon, label, onClick, isDestructive }: PopoverMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${isDestructive
          ? 'text-red-600 hover:bg-red-50'
          : 'text-accent-700 hover:bg-accent-50'
        }`}
    >
      <span className={isDestructive ? 'text-red-500' : 'text-accent-500'}>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

function SidebarItem({ icon, label, href, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
          ? 'bg-primary-400 text-white shadow-soft'
          : 'text-accent-700 hover:bg-accent-100 hover:text-accent-900'
        }`}
    >
      <span className={isActive ? 'text-white' : 'text-primary-400'}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
      {isActive && (
        <span className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse"></span>
      )}
    </Link>
  );
}
