import { Level } from '../logger/dict/level.enum';
import { SqlExceptionMap, SqlExceptionMapValue } from './dict/exception-maps';
import { RabbitExceptionCode } from './dict/exception-codes.enum';
import { ICustomException } from './custom-exception.interface';

class SqlException extends Error implements ICustomException {
  readonly name: 'DB SQL EXCEPTION';
  readonly details: SqlExceptionMapValue;

  constructor(
    code: RabbitExceptionCode,
    readonly level: Level,
    options?: { cause: unknown },
  ) {
    super('DB SQL EXCEPTION', {
      cause: options?.cause,
    });
    this.details = SqlExceptionMap[code];
  }
}

export default SqlException;
