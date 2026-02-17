'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import FlowlyMark from './FlowlyMark';
import AppearanceModal from './AppearanceModal';
import LanguageModal from './LanguageModal';
import { useTranslation } from '@/hooks/useTranslation';
import {
  NavIconOverview,
  NavIconBuckets,
  NavIconSavings,
  NavIconDebts,
  NavIconInsights,
  NavIconSettings,
} from './NavIcons';

export default function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isOverview = pathname === '/';
  const isBuckets = pathname === '/buckets';
  const isSavings = pathname === '/savings';
  const isDebts = pathname === '/debts';
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
          key="nav-overview"
          icon={<NavIconOverview className="w-5 h-5" />}
          label={t('nav.overview')}
          href="/"
          isActive={isOverview}
        />
        <SidebarItem
          key="nav-buckets"
          icon={<NavIconBuckets className="w-5 h-5" />}
          label={t('nav.buckets')}
          href="/buckets"
          isActive={isBuckets}
        />
        <SidebarItem
          key="nav-savings"
          icon={<NavIconSavings className="w-5 h-5" />}
          label={t('nav.savings')}
          href="/savings"
          isActive={isSavings}
        />
        <SidebarItem
          key="nav-debts"
          icon={<NavIconDebts className="w-5 h-5" />}
          label={t('nav.debts')}
          href="/debts"
          isActive={isDebts}
        />
        <SidebarItem
          key="nav-insights"
          icon={<NavIconInsights className="w-5 h-5" />}
          label={t('nav.insights')}
          href="/insights"
          isActive={isInsights}
        />
        <SidebarItem
          key="nav-settings"
          icon={<NavIconSettings className="w-5 h-5" />}
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
