"use client";
// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

try {
  Sentry.init({
    dsn: "https://8ae1929645664c46373317e7cabab8b0@o4511152518004736.ingest.us.sentry.io/4511153249910784",

    // Add optional integrations for additional features
    integrations: [Sentry.replayIntegration()],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // PII disabled - HIPAA compliance (no IPs, emails, or cookies sent to Sentry)
    sendDefaultPii: false,
  });
} catch {
  // Sentry initialisation is non-critical — must never break the client bundle.
}

// captureRouterTransitionStart is a client-only export added in @sentry/nextjs
// v9 for Next.js 15 App Router support.  Guard the export so that a version
// mismatch (or a server-side import) can never throw a ReferenceError.
export const onRouterTransitionStart =
  typeof Sentry.captureRouterTransitionStart === "function"
    ? Sentry.captureRouterTransitionStart
    : undefined;
