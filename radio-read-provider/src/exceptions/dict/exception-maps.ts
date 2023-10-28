import {
  ApplicationExceptionCode,
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

export type ApplicationExceptionMapValue = {
  message: string;
  code: ApplicationExceptionCode;
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
