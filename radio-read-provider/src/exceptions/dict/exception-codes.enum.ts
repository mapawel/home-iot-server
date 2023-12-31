export enum RadioExceptionCode {
  CONNECTION_ERROR = 1000,
  MESSAGE_READ_ERROR = 1010,
  MESSAGE_PARSE_ERROR = 1020,
  MESSAGE_VALIDATION_ERROR = 1030,
  UNKNOWN_ERROR = 1040,
}

export enum RabbitExceptionCode {
  CONNECTION_ERROR = 2000,
  MESSAGES_READING_ERROR = 2010,
  MESSAGES_SENDING_ERROR = 2020,
  UNKNOWN_ERROR = 2040,
}

export enum ApplicationExceptionCode {
  APP_START_ERROR = 3000,
  PROCEEDING_FLOW_ERROR = 3010,
  VALIDATION_FLOW_ERROR = 3020,
  UNKNOWN_ERROR = 3040,
}
