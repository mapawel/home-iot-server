import {
  RabbitExceptionCode,
  SqlExceptionCode,
  ValidationExceptionCode,
} from './exception-codes.enum';

export type SqlExceptionMapValue = {
  message: string;
  code: SqlExceptionCode;
};

export type RabbitExceptionMapValue = {
  message: string;
  code: RabbitExceptionCode;
};

export type ValidationExceptionMapValue = {
  message: string;
  code: ValidationExceptionCode;
};

export const SqlExceptionMap: Record<SqlExceptionCode, SqlExceptionMapValue> = {
  [SqlExceptionCode.CONNECTION_ERROR]: {
    message: 'Sql connection error',
    code: SqlExceptionCode.CONNECTION_ERROR,
  },
  [SqlExceptionCode.DB_READ_ERROR]: {
    message: 'Reading from DB error',
    code: SqlExceptionCode.DB_READ_ERROR,
  },
  [SqlExceptionCode.DB_INSERT_ERROR]: {
    message: 'Inserting to DB error',
    code: SqlExceptionCode.DB_INSERT_ERROR,
  },
  [SqlExceptionCode.DB_UPDATE_ERROR]: {
    message: 'Updating in DB error',
    code: SqlExceptionCode.DB_UPDATE_ERROR,
  },
  [SqlExceptionCode.DB_DELETE_ERROR]: {
    message: 'Deleting in DB error',
    code: SqlExceptionCode.DB_DELETE_ERROR,
  },
  [SqlExceptionCode.UNKNOWN_ERROR]: {
    message: 'Unexpected, unknown radio error',
    code: SqlExceptionCode.UNKNOWN_ERROR,
  },
};

export const RabbitExceptionMap: Record<
  RabbitExceptionCode,
  RabbitExceptionMapValue
> = {
  [RabbitExceptionCode.CONNECTION_ERROR]: {
    message: 'Radio connection error',
    code: RabbitExceptionCode.CONNECTION_ERROR,
  },
  [RabbitExceptionCode.MESSAGES_READING_ERROR]: {
    message: 'Reading message error',
    code: RabbitExceptionCode.MESSAGES_READING_ERROR,
  },
  [RabbitExceptionCode.MESSAGES_SENDING_ERROR]: {
    message: 'Parsing or merging message error',
    code: RabbitExceptionCode.MESSAGES_SENDING_ERROR,
  },
  [RabbitExceptionCode.UNKNOWN_ERROR]: {
    message: 'Unexpected, unknown radio error',
    code: RabbitExceptionCode.UNKNOWN_ERROR,
  },
};

export const ValidationExceptionMap: Record<
  ValidationExceptionCode,
  ValidationExceptionMapValue
> = {
  [ValidationExceptionCode.VALIDATION_ERROR]: {
    message: 'Validation not passed',
    code: ValidationExceptionCode.VALIDATION_ERROR,
  },
  [ValidationExceptionCode.UNKNOWN_VALIDATION_ERROR]: {
    message: 'Unexpected, unknown validation error',
    code: ValidationExceptionCode.UNKNOWN_VALIDATION_ERROR,
  },
};
