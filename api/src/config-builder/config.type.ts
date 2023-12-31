export type configType = {
  server: {
    port: number;
  };
  mysql: {
    host: string;
    username: string;
    database: string;
    password: string;
    port: number;
  };
  rabbitmq: {
    user: string;
    pass: string;
    host: string;
  };
};
