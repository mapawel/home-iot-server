import { ConfigBuilder } from './config-builder/Config-builder';
import { config } from './config-builder/config.type';

const { config }: { config: config } = ConfigBuilder.getInstance();

console.log('set port', config.server.port);
