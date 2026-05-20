import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const environment = import.meta.env.MODE;

export const isSentryEnabled = !!dsn && environment === "production";

if (isSentryEnabled) {
  Sentry.init({
    dsn,
    environment,
    // 10% trace sampling — production'da ucuz tutar, sorunlar başlayınca artırılır
    tracesSampleRate: 0.1,
    // Replay açık ama sadece error olduğunda kaydeder
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
    ],
    beforeSend(event) {
      // Production dışı / test build'lerinde olay göndermeyi engelle
      if (environment !== "production") return null;
      return event;
    },
  });
}

export function captureException(err: unknown, context?: Record<string, unknown>) {
  if (isSentryEnabled) {
    Sentry.captureException(err, { extra: context });
  } else {
    console.error("[error]", err, context);
  }
}

export function identifyUser(user: { id: string; name?: string | null; email?: string | null } | null) {
  if (!isSentryEnabled) return;
  if (user) {
    Sentry.setUser({ id: user.id, username: user.name ?? undefined, email: user.email ?? undefined });
  } else {
    Sentry.setUser(null);
  }
}

export const SentryErrorBoundary = Sentry.ErrorBoundary;
