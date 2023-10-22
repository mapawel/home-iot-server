import { configType } from './config.type';
import path from 'path';

class ConfigBuilder {
  private static instance: ConfigBuilder | null = null;
  public readonly config: configType;

  private constructor() {
    this.config = require(
      path.join(
        __dirname,
        '..',
        '..',
        'configuration',
        `${process.env.NODE_ENV}.js`,
      ),
    );
  }

  public static getInstance() {
    if (ConfigBuilder.instance) return ConfigBuilder.instance;
    return (ConfigBuilder.instance = new ConfigBuilder());
  }
}

export default ConfigBuilder;
