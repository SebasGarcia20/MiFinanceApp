import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get the current user ID from the server session
 * Throws an error with 401 status if not authenticated
 * @returns The user ID (never null)
 */
export async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  return session.user.id;
}
