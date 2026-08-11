import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Login rate limiter - 10 attempts per IP per 15 minutes
// In-memory: provides per-instance protection. For multi-region production,
// replace with Vercel KV / Upstash (@upstash/ratelimit).
// ---------------------------------------------------------------------------
type RateBucket = { count: number; resetAt: number };
const loginBuckets = new Map<string, RateBucket>();
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS    = 15 * 60 * 1000;

function checkLoginRateLimit(ip: string): boolean {
  const now  = Date.now();
  const key  = `login:${ip}`;
  const existing = loginBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    loginBuckets.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return true;
  }
  if (existing.count >= MAX_LOGIN_ATTEMPTS) return false;
  existing.count += 1;
  return true;
}

const { auth } = NextAuth({ ...authConfig, basePath: '/api/nyx-auth' });

export default auth(function middleware(req) {
  // Rate-limit the credentials login POST only
  if (
    req.method === 'POST' &&
    req.nextUrl.pathname === '/api/nyx-auth/callback/credentials'
  ) {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    if (!checkLoginRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429, headers: { 'Retry-After': '900' } },
      );
    }
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

