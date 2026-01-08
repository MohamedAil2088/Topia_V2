const Sentry = require("@sentry/node");

const initSentry = () => {
    Sentry.init({
        dsn: process.env.SENTRY_DSN || "", // Get from .env
        tracesSampleRate: 1.0,
    });
};

module.exports = { initSentry, Sentry };
