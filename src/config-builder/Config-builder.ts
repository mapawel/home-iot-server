import { readFileSync } from 'fs';
import { configType } from './config.type';

export class ConfigBuilder {
  private static readonly instance: ConfigBuilder | null = null;
  public readonly config: configType;

  private constructor() {
    this.config = JSON.parse(
      readFileSync(`./configuration/${process.env.NODE_ENV}.json`, 'utf8'),
    );
  }

  public static getInstance() {
    if (ConfigBuilder.instance) return ConfigBuilder.instance;
    return new ConfigBuilder();
  }
}
