import {
  ValidationExceptionMap,
  ValidationExceptionMapValue,
} from './dict/exception-maps';
import { ValidationExceptionCode } from './dict/exception-codes.enum';
import { CustomException } from './custom-exception.interface';

class ValidationException extends Error implements CustomException {
  readonly name: 'VALIDATION EXCEPTION';
  readonly details: ValidationExceptionMapValue;
  readonly cause: unknown;

  constructor(
    readonly code: ValidationExceptionCode,
    options?: { cause: unknown },
    readonly moduleId?: string,
  ) {
    super(ValidationExceptionMap[code].message, {
      cause: options?.cause,
    });
    this.cause = options?.cause;
    this.details = ValidationExceptionMap[code];
  }
}

export default ValidationException;
