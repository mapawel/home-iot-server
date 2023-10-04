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
};
