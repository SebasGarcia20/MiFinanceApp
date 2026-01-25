'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement password reset
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-accent-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-accent-900 mb-1">Reset password</h2>
            <div className="h-0.5 w-12 bg-primary-400 rounded-full"></div>
          </div>

          {isSubmitted ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                If an account exists with that email, we've sent password reset instructions.
              </div>
              <Link href="/login" className="btn-primary w-full py-2.5 text-center block">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-accent-600 mb-4">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-accent-700 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field w-full"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-2.5"
              >
                {isLoading ? 'Sending...' : 'Send reset instructions'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-accent-200 text-center">
            <Link
              href="/login"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
