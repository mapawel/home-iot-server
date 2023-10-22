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
};

module.exports = configuration;
