import { cookies, headers } from 'next/headers';

// ---------------------------------------------------------------------------
// Store shell detection
// ---------------------------------------------------------------------------
// The store builds (Google Play, App Store, Microsoft Store) are sign-in
// companions: subscriptions are sold only on the web through Stripe, and
// the standing house rule is that store shells hide every purchase entry
// point. Signed-in facilities keep full use of every module; only buying
// moves to the web.
//
// Mechanism (same shape the other Nyx shells use: the shell identifies
// itself on load and the web app remembers the flag): the shell loads the
// site with ?shell=store appended to its server.url. Middleware turns
// that first hit into a persistent cookie plus an x-nyx-shell request
// header (see src/middleware.ts), so the flag survives in-app navigation.
//
// A cookie is used for persistence instead of localStorage because the
// billing and pricing surfaces render on the server: the cookie is
// readable during server rendering, so purchase UI is left out of the
// HTML entirely. localStorage is only readable after client JS runs,
// which would ship the purchase UI in the page and hide it after paint.
export const SHELL_COOKIE = 'nyx-shell';
export const SHELL_HEADER = 'x-nyx-shell';
export const SHELL_VALUE = 'store';

export function isStoreShell(): boolean {
  try {
    if (headers().get(SHELL_HEADER) === SHELL_VALUE) return true;
    return cookies().get(SHELL_COOKIE)?.value === SHELL_VALUE;
  } catch {
    // Outside a request scope (for example static generation) there is
    // no shell; treat it as a normal web visit.
    return false;
  }
}
