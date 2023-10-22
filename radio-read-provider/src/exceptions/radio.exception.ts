import { Level } from '../logger/dict/level.enum';
import {
  RadioExceptionMap,
  RadioExceptionMapValue,
} from './dict/exception-maps';
import { RadioExceptionCode } from './dict/exception-codes.enum';
import { ICustomException } from './custom-exception.interface';

class RadioException extends Error implements ICustomException {
  readonly name: 'RADIO EXCEPTION';
  readonly details: RadioExceptionMapValue;

  constructor(
    code: RadioExceptionCode,
    readonly level: Level,
    options?: { cause: unknown },
  ) {
    super('RADIO EXCEPTION', {
      cause: options?.cause,
    });
    this.details = RadioExceptionMap[code];
  }
}

export default RadioException;
