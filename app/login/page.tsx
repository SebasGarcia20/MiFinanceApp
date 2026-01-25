'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import FlowlyMark from '@/components/FlowlyMark';


const ALLOWED_REDIRECT_PREFIXES = ['/', '/buckets', '/savings', '/settings', '/profile'];

function sanitizeCallbackUrl(raw: string | null) {
  if (!raw) return '/';

  // decode por si viene %2F...
  let url = raw;
  try {
    url = decodeURIComponent(raw);
  } catch {}

  // solo rutas internas
  if (!url.startsWith('/')) return '/';

  // evita cosas raras tipo // o /api/auth...
  if (url.startsWith('//') || url.startsWith('/api/auth')) return '/';

  // permite solo destinos conocidos (puedes ampliar esto)
  const ok = ALLOWED_REDIRECT_PREFIXES.some((p) => url === p || url.startsWith(p + '/'));
  return ok ? url : '/';
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');

  const callbackUrl = useMemo(
    () => sanitizeCallbackUrl(searchParams.get('callbackUrl')),
    [searchParams]
  );
  
  // Redirect authenticated users to overview
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Only redirect if we're actually on the login page
      // This prevents redirect loops
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        const targetUrl = callbackUrl || '/';
        // Immediate redirect - JWT sessions are available instantly
        window.location.href = targetUrl;
      }
    }
  }, [status, session, callbackUrl]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-accent-50 flex items-center justify-center">
        <div className="text-accent-600">Loading...</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    // Show a loading state while redirecting
    // This prevents the white screen and gives visual feedback
    return (
      <div className="min-h-screen bg-accent-50 flex items-center justify-center">
        <div className="text-accent-600">Redirecting...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-accent-50 flex">
      {/* Left side - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, #000 2px, transparent 2px),
                              linear-gradient(to bottom, #000 2px, transparent 2px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Subtle vertical divider */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent-200 to-transparent"></div>
        
        <div className="max-w-md relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <FlowlyMark size={48} className="text-primary-500" />
            <h1 className="text-5xl font-extrabold text-accent-900 tracking-tight" style={{ letterSpacing: '0.015em' }}>Flowly</h1>
          </div>
          <p className="text-xl text-accent-500 leading-relaxed opacity-90 font-normal">Track your money, effortlessly</p>
          <div className="h-1 w-24 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full mt-6"></div>
        </div>
      </div>

      {/* Right side - Auth card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="card opacity-0 translate-y-3 animate-[fadeInUp_0.4s_ease-out_0.1s_forwards]">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-accent-900 mb-2">Welcome to Flowly</h2>
              <p className="text-sm text-accent-600 mb-4">Sign in with your Google account to continue</p>
              <div className="h-0.5 w-16 bg-primary-400 rounded-full"></div>
            </div>

            <div className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-scale-in">
                  {error}
                </div>
              )}

              {/* Google Sign In Button - Primary CTA */}
              <button
                type="button"
                onClick={() => {
                  // Use the callbackUrl directly, or '/' as fallback
                  const targetUrl = callbackUrl || '/';
                  signIn('google', { callbackUrl: targetUrl, redirect: true });
                }}
                className="w-full py-3.5 px-4 bg-white border-2 border-primary-400 rounded-lg font-semibold text-sm text-accent-900 hover:bg-primary-50 hover:border-primary-500 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-3 shadow-soft hover:shadow-soft-lg"
              >
                <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
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
                <span>Continue with Google</span>
              </button>

              {/* Note about Google-only access */}
              <div className="pt-4">
                <div className="bg-accent-50 border border-accent-200 rounded-lg p-3">
                  <p className="text-xs text-accent-600 text-center leading-relaxed">
                    <span className="font-medium text-accent-700">For now, sign in with Google. Email/password coming later.</span>
                  </p>
                </div>
              </div>

              {/* Need access link */}
              <div className="pt-3">
                <p className="text-xs text-accent-500 text-center">
                  Need access?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // TODO: Add contact functionality
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors underline-offset-2 hover:underline"
                  >
                    Contact the owner
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-accent-50 flex items-center justify-center">
        <div className="text-accent-600">Loading...</div>
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
