import type { NextAuthConfig, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { User } from 'next-auth';

// Lightweight auth config - no bcryptjs, no Prisma.
// Used ONLY by middleware (Edge Runtime compatible).
// The Credentials provider (which uses bcryptjs) is in src/lib/auth.ts.
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: Session | null; request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/login');
      const isApiAuth  = nextUrl.pathname.startsWith('/api/nyx-auth');
      const isPublic   =
        nextUrl.pathname === '/' ||
        nextUrl.pathname.startsWith('/signup') ||
        nextUrl.pathname.startsWith('/guide') ||
        nextUrl.pathname.startsWith('/priority-partner-portal') ||
        nextUrl.pathname.startsWith('/walkthrough') ||
        nextUrl.pathname.startsWith('/terms') ||
        nextUrl.pathname.startsWith('/privacy') ||
        nextUrl.pathname.startsWith('/contact') ||
        nextUrl.pathname.startsWith('/drill-task/') ||
        nextUrl.pathname.startsWith('/drill-muster/') ||
        nextUrl.pathname.startsWith('/monitoring') ||
        isApiAuth;

      if (isPublic)   return true;
      if (isAuthPage) return isLoggedIn ? Response.redirect(new URL('/dashboard', nextUrl)) : true;
      if (!isLoggedIn) return false; // redirects to pages.signIn automatically
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: User | null }) {
      if (user) {
        token.id         = user.id;
        token.role       = (user as any).role;
        token.facilityId = (user as any).facilityId;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
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
