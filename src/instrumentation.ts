import * as Sentry from "@sentry/nextjs";

export async function register() {
  try {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("../sentry.server.config");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      await import("../sentry.edge.config");
    }
  } catch {
    // Sentry initialisation is non-critical — must never prevent the server from starting.
  }
}

// captureRequestError may not exist in all Sentry versions (it was added in
// @sentry/nextjs v9). Guard the export so a version mismatch can never throw
// a ReferenceError when Next.js imports this file.
export const onRequestError =
  typeof Sentry.captureRequestError === "function"
    ? Sentry.captureRequestError
    : undefined;
