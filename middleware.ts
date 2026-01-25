import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    
    // If we're on the login page, always allow it (don't redirect authenticated users away)
    // This prevents redirect loops during authentication
    if (pathname.startsWith('/login')) {
      return NextResponse.next();
    }
    
    // For all other routes, proceed normally
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Always allow login, auth API routes, and public pages
        const publicPaths = ['/login', '/api/auth', '/signup', '/forgot-password'];
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true; // Always allow public paths
        }
        
        // For protected routes, require token
        // If no token, middleware will redirect to /login with callbackUrl
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icon|login|signup|forgot-password).*)',
  ],
};
