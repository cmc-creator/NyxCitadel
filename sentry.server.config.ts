// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

try {
  Sentry.init({
    dsn: "https://8ae1929645664c46373317e7cabab8b0@o4511152518004736.ingest.us.sentry.io/4511153249910784",

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // PII disabled - HIPAA compliance (no IPs, emails, or cookies sent to Sentry)
    sendDefaultPii: false,
  });
} catch {
  // Sentry initialisation is non-critical — a bad DSN or network issue must
  // never prevent the server from starting.
}
