import { ExceptionLevel } from './dict/exception-level.enum';
import { ICustomException } from './custom-exception.interface';

class ApplicationException extends Error implements ICustomException {
  readonly name: 'APPLICATION EXCEPTION';

  constructor(
    message: string,
    readonly level: ExceptionLevel,
    options?: { cause: unknown },
  ) {
    super('APPLICATION EXCEPTION', {
      cause: options?.cause,
    });
  }
}

export default ApplicationException;
