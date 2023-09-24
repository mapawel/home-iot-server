const configuration = {
  server: {
    port: 8080,
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
};

module.exports = configuration;
