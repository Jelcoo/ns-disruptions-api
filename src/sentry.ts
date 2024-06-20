import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

if (process.env.SENTRY_ENABLED) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,

        integrations: [
            nodeProfilingIntegration(),
        ],

        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
    });
}
