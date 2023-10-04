import { ExceptionLevel } from './dict/exception-level.enum';
import {
  RabbitExceptionMap,
  RabbitExceptionMapValue,
} from './dict/exception-maps';
import { RabbitExceptionCode } from './dict/exception-codes.enum';
import { ICustomException } from './custom-exception.interface';

class RabbitException extends Error implements ICustomException {
  readonly data: RabbitExceptionMapValue;
  readonly name: 'RABBIT EXCEPTION';

  constructor(
    code: RabbitExceptionCode,
    readonly level: ExceptionLevel,
    options?: { cause: unknown },
  ) {
    super('RABBIT EXCEPTION', {
      cause: options?.cause,
    });
    this.data = RabbitExceptionMap[code];
  }
}

export default RabbitException;
