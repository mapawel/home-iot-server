import { Level } from '../logger/dict/level.enum';
import { ICustomException } from './custom-exception.interface';

class ApplicationException extends Error implements ICustomException {
  readonly name: 'APPLICATION EXCEPTION';

  constructor(
    message: string,
    readonly level: Level,
    options?: { cause: unknown },
  ) {
    super(message, {
      cause: options?.cause,
    });
  }
}

export default ApplicationException;
