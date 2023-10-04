import { ExceptionLevel } from './dict/exception-level.enum';
import {
  RadioExceptionMap,
  RadioExceptionMapValue,
} from './dict/exception-maps';
import { RadioExceptionCode } from './dict/exception-codes.enum';
import { ICustomException } from './custom-exception.interface';

class RadioException extends Error implements ICustomException {
  readonly data: RadioExceptionMapValue;
  readonly name: 'RADIO EXCEPTION';

  constructor(
    code: RadioExceptionCode,
    readonly level: ExceptionLevel,
    options?: { cause: unknown },
  ) {
    super('RADIO EXCEPTION', {
      cause: options?.cause,
    });
    this.data = RadioExceptionMap[code];
  }
}

export default RadioException;
