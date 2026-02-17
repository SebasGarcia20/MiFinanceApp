'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import {
  NavIconOverview,
  NavIconBuckets,
  NavIconSavings,
  NavIconDebts,
  NavIconInsights,
  NavIconSettings,
} from './NavIcons';

export default function BottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  
  const isOverview = pathname === '/';
  const isBuckets = pathname === '/buckets';
  const isSavings = pathname === '/savings';
  const isDebts = pathname === '/debts';
  const isInsights = pathname === '/insights';
  const isSettings = pathname === '/settings';

  const iconClass = 'w-4 h-4 flex-shrink-0';
  const navItems = [
    { href: '/', label: t('nav.overview'), icon: <NavIconOverview className={iconClass} />, isActive: isOverview },
    { href: '/buckets', label: t('nav.buckets'), icon: <NavIconBuckets className={iconClass} />, isActive: isBuckets },
    { href: '/savings', label: t('nav.savings'), icon: <NavIconSavings className={iconClass} />, isActive: isSavings },
    { href: '/debts', label: t('nav.debts'), icon: <NavIconDebts className={iconClass} />, isActive: isDebts },
    { href: '/insights', label: t('nav.insights'), icon: <NavIconInsights className={iconClass} />, isActive: isInsights },
    { href: '/settings', label: t('nav.settings'), icon: <NavIconSettings className={iconClass} />, isActive: isSettings },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-accent-200 shadow-soft-lg z-50 lg:hidden safe-area-bottom"
      role="navigation"
      aria-label="Main"
    >
      <div className="flex w-full h-16 overflow-hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.isActive ? 'page' : undefined}
            title={item.label}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-2 px-1 overflow-hidden transition-colors duration-200 [touch-action:manipulation] ${
              item.isActive
                ? 'text-primary-500 bg-primary-50'
                : 'text-accent-500 hover:text-accent-700 hover:bg-accent-50 active:bg-accent-100'
            }`}
          >
            <span className={`flex-shrink-0 ${item.isActive ? 'text-primary-500' : 'text-accent-500'}`}>
              {item.icon}
            </span>
            <span
              className={`text-[11px] sm:text-xs font-medium truncate w-full min-w-0 text-center block ${item.isActive ? 'text-primary-600' : 'text-accent-600'}`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
