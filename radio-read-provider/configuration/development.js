const configuration = {
  server: {
    port: 6000,
  },
  rabbitmq: {
    user: process.env.RABBITMQ_USER || '',
    pass: process.env.RABBITMQ_PASS || '',
    host: 'rabbitmq',
  },
  fileLogger: {
    path: [__dirname, '..', 'logs'],
    fileName: 'logs.txt',
  },
  usedLoggers: {
    sentry: true,
    file: true,
    console: true,
  },
  sentry: {
    dsn: process.env.SENTRY_DNS,
    debug: true,
    normalizeDepth: 5,
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    profilesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  },
};

module.exports = configuration;
