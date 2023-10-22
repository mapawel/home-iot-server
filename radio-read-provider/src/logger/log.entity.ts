import { Level } from './dict/level.enum';
import { ICustomException } from '../exceptions/custom-exception.interface';
import { IInfoLog } from './info-log.interface';

class Log {
  readonly appName = 'MESSAGE_PROVIDER';
  readonly timestamp = new Date().toISOString();
  readonly level: Level;
  readonly message: string;
  readonly details: ICustomException | IInfoLog;

  constructor(readonly errorOrData: ICustomException | IInfoLog) {
    this.message = errorOrData.message;
    this.level =
      'level' in errorOrData && errorOrData.level
        ? errorOrData.level
        : Level.INFO;
    this.details = errorOrData;
  }
}

export default Log;
