import type { NextAuthConfig } from 'next-auth';

// Lightweight auth config — no bcryptjs, no Prisma.
// Used ONLY by middleware (Edge Runtime compatible).
// The Credentials provider (which uses bcryptjs) is in src/lib/auth.ts.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/login');
      const isApiAuth  = nextUrl.pathname.startsWith('/api/auth');
      const isPublic   = nextUrl.pathname === '/' || isApiAuth;

      if (isPublic)   return true;
      if (isAuthPage) return isLoggedIn ? Response.redirect(new URL('/dashboard', nextUrl)) : true;
      if (!isLoggedIn) return false; // redirects to pages.signIn automatically
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id         = user.id;
        token.role       = (user as any).role;
        token.facilityId = (user as any).facilityId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id         = token.id as string;
        (session.user as any).role       = token.role;
        (session.user as any).facilityId = token.facilityId;
      }
      return session;
    },
  },
  providers: [], // providers added in src/lib/auth.ts
};
