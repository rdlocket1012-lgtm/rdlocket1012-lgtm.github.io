import * as Sentry from '@sentry/react-native';

/**
 * Crash + error reporting. DSN is injected via env (EXPO_PUBLIC_SENTRY_DSN) so
 * no secret lives in git. When the DSN is absent — e.g. local dev where you
 * don't want noise — init is skipped and every Sentry.* call becomes a no-op.
 *
 * Call once, as early as possible, before the app renders.
 */
export const sentryEnabled = !!process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry() {
  if (!sentryEnabled) return;

  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    // We only want crash/error reporting for now — no performance tracing,
    // which keeps both overhead and your event quota low. Bump this later if
    // you want transaction/perf data.
    tracesSampleRate: 0,
    // Don't attach IP addresses or other personal identifiers by default.
    sendDefaultPii: false,
    // Surface the JS environment so prod vs preview crashes are separable.
    environment: __DEV__ ? 'development' : 'production',
    // In dev, log crashes to console instead of shipping them.
    enabled: !__DEV__,
  });
}

export { Sentry };
