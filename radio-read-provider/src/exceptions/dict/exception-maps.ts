import {
  RabbitExceptionCode,
  RadioExceptionCode,
} from './exception-codes.enum';

export type RadioExceptionMapValue = {
  message: string;
  code: RadioExceptionCode;
};

export type RabbitExceptionMapValue = {
  message: string;
  code: RabbitExceptionCode;
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
