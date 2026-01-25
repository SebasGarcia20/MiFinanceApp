import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { ensureUserDefaults } from '@/lib/userDefaults';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt', // Changed from 'database' to 'jwt' to avoid timing issues
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect errors to login
  },
  callbacks: {
    async signIn({ user }) {
      if (user?.id) {
        await ensureUserDefaults(user.id);
      }
      return true;
    },
    async session({ session, token, user }) {
      // For JWT strategy, use token; for database strategy, use user
      if (session.user) {
        session.user.id = token?.sub || user?.id || '';
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Persist user ID to token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // After successful authentication, NextAuth might try to redirect to /login?callbackUrl=...
      // We MUST intercept this and redirect directly to the callbackUrl to avoid loops
      if (url.includes('/login')) {
        try {
          const urlObj = new URL(url, baseUrl);
          const callbackUrl = urlObj.searchParams.get('callbackUrl');
          if (callbackUrl) {
            // Decode the callback URL (e.g., %2F becomes /)
            const decoded = decodeURIComponent(callbackUrl);
            // CRITICAL: Redirect directly to the callback URL, NOT to /login
            // This prevents the infinite redirect loop
            return decoded.startsWith('/') ? `${baseUrl}${decoded}` : `${baseUrl}/${decoded}`;
          }
          // No callbackUrl, go to home
          return baseUrl;
        } catch (error) {
          // If parsing fails, go to home
          console.error('Redirect callback error:', error);
          return baseUrl;
        }
      }
      
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Allow same-origin URLs
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) {
          return url;
        }
      } catch {
        // Invalid URL
      }
      
      // Default to home
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        await ensureUserDefaults(user.id);
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
