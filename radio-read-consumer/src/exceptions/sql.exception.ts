import { SqlExceptionMap, SqlExceptionMapValue } from './dict/exception-maps';
import { SqlExceptionCode } from './dict/exception-codes.enum';
import { CustomException } from './custom-exception.interface';

class SqlException extends Error implements CustomException {
  readonly name: 'DB SQL EXCEPTION';
  readonly details: SqlExceptionMapValue;
  readonly cause: unknown;

  constructor(
    readonly code: SqlExceptionCode,
    options?: { cause: unknown },
    readonly moduleId?: string,
  ) {
    super(SqlExceptionMap[code].message, {
      cause: options?.cause,
    });
    this.cause = options?.cause;
    this.details = SqlExceptionMap[code];
  }
}

export default SqlException;
