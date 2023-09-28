import { ExceptionLevel } from './dict/exception-level.enum';
import ServiceException from './service.exception';
import {
  RadioExceptionMap,
  RadioExceptionMapValue,
} from './dict/exception-maps';
import { RadioExceptionCode } from './dict/exception-codes.enum';

class RadioException extends ServiceException {
  readonly data: RadioExceptionMapValue;

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
