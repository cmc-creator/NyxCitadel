import { NextResponse } from 'next/server';

const COOKIE_NAME = 'nyxcitadel-onboarding-dismissed';
const ONE_YEAR   = 60 * 60 * 24 * 365;

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, '1', {
    httpOnly: true,
    sameSite: 'lax',
    path:     '/',
    maxAge:   ONE_YEAR,
  });
  return res;
}
