'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();
  
  const isOverview = pathname === '/';
  const isBuckets = pathname === '/buckets';
  const isSavings = pathname === '/savings';
  const isInsights = pathname === '/insights';
  const isSettings = pathname === '/settings';

  const iconClass = 'w-4 h-4 flex-shrink-0';
  const navItems = [
    {
      href: '/',
      label: 'Overview',
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      isActive: isOverview,
    },
    {
      href: '/buckets',
      label: 'Buckets',
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      isActive: isBuckets,
    },
    {
      href: '/savings',
      label: 'Savings',
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      isActive: isSavings,
    },
    {
      href: '/insights',
      label: 'Insights',
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      isActive: isInsights,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      isActive: isSettings,
    },
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
