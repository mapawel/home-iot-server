import { CustomException } from './custom-exception.interface';
import {
  ApplicationExceptionMap,
  ApplicationExceptionMapValue,
} from './dict/exception-maps';
import { ApplicationExceptionCode } from './dict/exception-codes.enum';

class ApplicationException extends Error implements CustomException {
  readonly name: 'APPLICATION GENERAL EXCEPTION';
  readonly details: ApplicationExceptionMapValue;
  readonly cause: unknown;

  constructor(
    readonly code: ApplicationExceptionCode,
    options?: { cause: unknown },
    readonly moduleId?: string,
  ) {
    super(ApplicationExceptionMap[code].message, {
      cause: options?.cause,
    });
    this.cause = options?.cause;
    this.details = ApplicationExceptionMap[code];
  }
}

export default ApplicationException;
