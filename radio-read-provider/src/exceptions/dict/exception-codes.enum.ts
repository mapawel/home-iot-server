export enum RadioExceptionCode {
  CONNECTION_ERROR = 1000,
  MESSAGE_READ_ERROR = 1010,
  MESSAGE_PARSE_ERROR = 1020,
  MESSAGE_VALIDATION_ERROR = 1030,
  UNKNOWN_ERROR = 1040,
}

export enum RabbitExceptionCode {
  CONNECTION_ERROR = 1000,
  MESSAGES_READING_ERROR = 1010,
  MESSAGES_SENDING_ERROR = 1020,
  UNKNOWN_ERROR = 1040,
}
