export type configType = {
  server: {
    port: number;
  };
  rabbitmq: {
    user: string;
    pass: string;
    host: string;
  };
  fileLogger: {
    path: string[];
    fileName: string;
  };
  usedLoggers: {
    sentry: boolean;
    file: boolean;
    console: boolean;
  };
  sentry: {
    dsn: string;
    debug: boolean;
    normalizeDepth: number;
    tracesSampleRate: number;
    profilesSampleRate: number;
  };
};
