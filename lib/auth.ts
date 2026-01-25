import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get the current user ID from the server session
 * @returns The user ID if authenticated, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

/**
 * Get the current user ID from the server session, or redirect to login if not authenticated
 * @returns The user ID (never null)
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect('/login');
  }
  return userId;
}

/**
 * Get the current user session with full user data
 * @returns The session object if authenticated, null otherwise
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions);
}
