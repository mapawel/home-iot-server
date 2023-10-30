export type configType = {
  appName: string;
  server: {
    port: number;
  };
  rabbitmq: {
    user: string;
    pass: string;
    host: string;
  };
  usedLoggers: {
    sentry: boolean;
    file: boolean;
    console: boolean;
  };
  loggersDetails: {
    console: {
      level: string;
      handleExceptions: boolean;
      json: boolean;
      colorize: boolean;
    };
    file: {
      level: string;
      handleExceptions: boolean;
      filename: string;
      json: boolean;
      maxsize: number;
      maxFiles: number;
      colorize: boolean;
    };
    sentry: {
      level: string;
      dsn: string;
    };
    exitOnError: boolean;
  };
};
