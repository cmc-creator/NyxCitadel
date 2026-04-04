import { type NextRequest, NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

// Paths that must always be accessible — checked BEFORE NextAuth runs so a
// missing AUTH_SECRET or any NextAuth init failure can never block them.
const PUBLIC_PREFIXES = [
  '/monitoring',
  '/api/nyx-auth',
  '/api/health',
  '/drill-task/',
  '/drill-muster/',
  '/signup',
  '/guide',
  '/priority-partner-portal',
  '/walkthrough',
  '/terms',
  '/privacy',
  '/contact',
];
const PUBLIC_EXACT = new Set(['/', '/sitemap.xml']);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// Initialise the NextAuth middleware once. If it throws (e.g. missing
// AUTH_SECRET in production) we fall back to a simple redirect-to-login
// strategy for protected routes rather than crashing every request.
let _authMiddleware: ((req: NextRequest) => Response | Promise<Response>) | null = null;
try {
  // NextAuth's `.auth` return type is a heavily overloaded function union that
  // doesn't satisfy a simple `(req: NextRequest) => Response` signature, so we
  // use `any` here.  The runtime contract is correct.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _authMiddleware = NextAuth({ ...authConfig, basePath: '/api/nyx-auth' }).auth as any;
} catch {
  // AUTH_SECRET or another required setting is missing.  The app will still
  // serve public pages; protected routes redirect to /login.
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths are always allowed — no auth check needed.
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Protected routes — delegate to NextAuth when available.
  if (_authMiddleware) {
    return _authMiddleware(request);
  }

  // Fallback: NextAuth failed to initialise — send the user to /login.
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
