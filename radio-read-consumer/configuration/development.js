// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const configuration = {
  appName: 'RABBIT MESSAGES CONSUMER',
  server: {
    port: 9080,
  },
  mysql: {
    host: 'mysql',
    username: process.env.MYSQL_USER || '',
    database: process.env.MYSQL_DATABASE || '',
    password: process.env.MYSQL_PASSWORD || '',
    port: 3306,
  },
  rabbitmq: {
    user: process.env.RABBITMQ_USER || '',
    pass: process.env.RABBITMQ_PASS || '',
    host: 'rabbitmq',
  },
  usedLoggers: {
    sentry: true,
    file: true,
    console: true,
  },
  loggersDetails: {
    console: {
      level: 'info',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
    file: {
      level: 'info',
      handleExceptions: true,
      filename: path.join(__dirname, '..', 'logs', 'radio-provider-logs.log'),
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 20,
      colorize: true,
    },
    sentry: {
      level: 'info',
      dsn: process.env.SENTRY_DNS,
    },
    exitOnError: false,
  },
  appHashKey: process.env.HASH_SHA256,
};

module.exports = configuration;
