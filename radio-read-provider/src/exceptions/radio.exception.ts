import {
  RadioExceptionMap,
  RadioExceptionMapValue,
} from './dict/exception-maps';
import { RadioExceptionCode } from './dict/exception-codes.enum';
import { CustomException } from './custom-exception.interface';
import { inspect } from 'util';

class RadioException extends Error implements CustomException {
  readonly name: 'RADIO EXCEPTION';
  readonly details: RadioExceptionMapValue;
  readonly cause: string;

  constructor(
    readonly code: RadioExceptionCode,
    options?: { cause: unknown },
    readonly moduleId?: string,
  ) {
    super(RadioExceptionMap[code].message, {
      cause: options?.cause,
    });
    this.cause = inspect(options?.cause);
    this.details = RadioExceptionMap[code];
  }
}

export default RadioException;
