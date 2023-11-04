import { DataSource } from 'typeorm';
import ConfigBuilder from '../../config-builder/Config-builder';
import { configType } from '../../config-builder/config.type';

const {
  config: {
    mysql: { host, port, password, username, database },
  },
}: { config: configType } = ConfigBuilder.getInstance();

const mySQLDataSource = new DataSource({
  type: 'mysql',
  host,
  port,
  username,
  password,
  database,
  entities: ['./**/entity/*.ts'],
  logging: false,
  synchronize: false,
});

export default mySQLDataSource;
