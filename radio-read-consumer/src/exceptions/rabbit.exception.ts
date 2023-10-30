import {
  RabbitExceptionMap,
  RabbitExceptionMapValue,
} from './dict/exception-maps';
import { RabbitExceptionCode } from './dict/exception-codes.enum';
import { CustomException } from './custom-exception.interface';

class RabbitException extends Error implements CustomException {
  readonly name: 'RABBIT EXCEPTION';
  readonly details: RabbitExceptionMapValue;
  readonly cause: unknown;

  constructor(
    readonly code: RabbitExceptionCode,
    options?: { cause: unknown },
    readonly moduleId?: string,
  ) {
    super(RabbitExceptionMap[code].message, {
      cause: options?.cause,
    });
    this.cause = options?.cause;
    this.details = RabbitExceptionMap[code];
  }
}

export default RabbitException;
