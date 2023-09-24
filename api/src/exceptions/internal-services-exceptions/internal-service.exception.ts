export class InternalServiceException extends Error {
  code = 500;

  constructor(
    readonly message: string,
    readonly cause?: Error,
  ) {
    super(message, { cause });
  }
}
