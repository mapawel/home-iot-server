import {
  ApplicationExceptionCode,
  RabbitExceptionCode,
  RadioExceptionCode,
  SqlExceptionCode,
  ValidationExceptionCode,
} from './exception-codes.enum';

export type RadioExceptionMapValue = {
  message: string;
  code: RadioExceptionCode;
};

export type RabbitExceptionMapValue = {
  message: string;
  code: RabbitExceptionCode;
};

export type ApplicationExceptionMapValue = {
  message: string;
  code: ApplicationExceptionCode;
};

export type SqlExceptionMapValue = {
  message: string;
  code: SqlExceptionCode;
};

export type ValidationExceptionMapValue = {
  message: string;
  code: ValidationExceptionCode;
};

export const RadioExceptionMap: Record<
  RadioExceptionCode,
  RadioExceptionMapValue
> = {
  [RadioExceptionCode.CONNECTION_ERROR]: {
    message: 'Radio connection error',
    code: RadioExceptionCode.CONNECTION_ERROR,
  },
  [RadioExceptionCode.MESSAGE_READ_ERROR]: {
    message: 'Reading message error',
    code: RadioExceptionCode.MESSAGE_READ_ERROR,
  },
  [RadioExceptionCode.MESSAGE_PARSE_ERROR]: {
    message: 'Parsing or merging message error',
    code: RadioExceptionCode.MESSAGE_PARSE_ERROR,
  },
  [RadioExceptionCode.MESSAGE_VALIDATION_ERROR]: {
    message: 'Message validating error',
    code: RadioExceptionCode.MESSAGE_VALIDATION_ERROR,
  },
  [RadioExceptionCode.UNKNOWN_ERROR]: {
    message: 'Unexpected, unknown radio error',
    code: RadioExceptionCode.UNKNOWN_ERROR,
  },
};

export const RabbitExceptionMap: Record<
  RabbitExceptionCode,
  RabbitExceptionMapValue
> = {
  [RabbitExceptionCode.CONNECTION_ERROR]: {
    message: 'Rabbit connection error',
    code: RabbitExceptionCode.CONNECTION_ERROR,
  },
  [RabbitExceptionCode.MESSAGES_READING_ERROR]: {
    message: 'Reading message from Rabbit error',
    code: RabbitExceptionCode.MESSAGES_READING_ERROR,
  },
  [RabbitExceptionCode.MESSAGES_SENDING_ERROR]: {
    message: 'Parsing or merging message error',
    code: RabbitExceptionCode.MESSAGES_SENDING_ERROR,
  },
  [RabbitExceptionCode.UNKNOWN_ERROR]: {
    message: 'Unexpected, unknown Rabbit error',
    code: RabbitExceptionCode.UNKNOWN_ERROR,
  },
};

export const ApplicationExceptionMap: Record<
  ApplicationExceptionCode,
  ApplicationExceptionMapValue
> = {
  [ApplicationExceptionCode.APP_START_ERROR]: {
    message: 'Cannot start app server',
    code: ApplicationExceptionCode.APP_START_ERROR,
  },
  [ApplicationExceptionCode.PROCEEDING_FLOW_ERROR]: {
    message:
      'Cannot proceed task which are activated by message (callback error in rabbit data source service)',
    code: ApplicationExceptionCode.PROCEEDING_FLOW_ERROR,
  },
  [ApplicationExceptionCode.VALIDATION_FLOW_ERROR]: {
    message: 'Validation error, cannot create instance',
    code: ApplicationExceptionCode.VALIDATION_FLOW_ERROR,
  },
  [ApplicationExceptionCode.UNKNOWN_ERROR]: {
    message: 'Unexpected, unknown application error',
    code: ApplicationExceptionCode.UNKNOWN_ERROR,
  },
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

export const ValidationExceptionMap: Record<
  ValidationExceptionCode,
  ValidationExceptionMapValue
> = {
  [ValidationExceptionCode.VALIDATION_HASH_ERROR]: {
    message:
      'Hash provided with message not equal to hash created with app hash private key!!!',
    code: ValidationExceptionCode.VALIDATION_HASH_ERROR,
  },
  [ValidationExceptionCode.VALIDATION_MODULE_ID_ERROR]: {
    message:
      'Module ID provided with message not found in DB! Message not valid!',
    code: ValidationExceptionCode.VALIDATION_MODULE_ID_ERROR,
  },
  [ValidationExceptionCode.VALIDATION_MODULE_DECRIPTION_ERROR]: {
    message:
      'Decrption module encrypted data using module private key from DB failed!!!',
    code: ValidationExceptionCode.VALIDATION_MODULE_DECRIPTION_ERROR,
  },
  [ValidationExceptionCode.VALIDATION_MODULE_TIMESTAMP_ERROR]: {
    message:
      'Timestamp from message is equal or smaller than last read date for this module.',
    code: ValidationExceptionCode.VALIDATION_MODULE_TIMESTAMP_ERROR,
  },
  [ValidationExceptionCode.VALIDATION_MODULE_READINGS_PARSING_ERROR]: {
    message: 'Could not parse readings JSON data to object!',
    code: ValidationExceptionCode.VALIDATION_MODULE_READINGS_PARSING_ERROR,
  },
  [ValidationExceptionCode.VALIDATION_MODULE_READINGS_TRANSLATION_ERROR]: {
    message:
      'Could not match parsed readings object keys from message with reading types declared for module in DB',
    code: ValidationExceptionCode.VALIDATION_MODULE_READINGS_TRANSLATION_ERROR,
  },
  [ValidationExceptionCode.VALIDATION_MODULE_READINGS_GENERAL_ERROR]: {
    message: 'Could not read, valid message and map to object.',
    code: ValidationExceptionCode.VALIDATION_MODULE_READINGS_GENERAL_ERROR,
  },
  [ValidationExceptionCode.UNKNOWN_VALIDATION_ERROR]: {
    message: 'Unexpected, unknown validation error',
    code: ValidationExceptionCode.UNKNOWN_VALIDATION_ERROR,
  },
};
