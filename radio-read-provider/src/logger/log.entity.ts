import { LogLevel } from './dict/log-level.enum';

class Log {
  readonly appName = 'MESSAGE_PROVIDER';
  readonly timestamp = new Date().toISOString();
  readonly level: LogLevel;
  readonly message: string;
  readonly data: unknown;

  constructor({
    level,
    message,
    data,
  }: {
    level: LogLevel;
    message: string;
    data: unknown;
  }) {
    this.level = level;
    this.message = message;
    this.data = data;
  }
}

export default Log;
