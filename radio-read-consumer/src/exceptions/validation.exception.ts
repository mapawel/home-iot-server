import { Level } from '../logger/dict/level.enum';
import {
  ValidationExceptionMap,
  ValidationExceptionMapValue,
} from './dict/exception-maps';
import { ValidationExceptionCode } from './dict/exception-codes.enum';
import { ICustomException } from './custom-exception.interface';

class ValidationException extends Error implements ICustomException {
  readonly name: 'VALIDATION EXCEPTION';
  readonly details: ValidationExceptionMapValue;

  constructor(
    code: ValidationExceptionCode,
    readonly level: Level,
    options?: { cause: unknown },
  ) {
    super('VALIDATION EXCEPTION', {
      cause: options?.cause,
    });
    this.details = ValidationExceptionMap[code];
  }
}

export default ValidationException;
