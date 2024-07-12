import * as Sentry from '@sentry/node';

if (process.env.SENTRY_ENABLED) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,

        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
    });
}
