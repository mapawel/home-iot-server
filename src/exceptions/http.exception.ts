export class HttpException extends Error {
  constructor(
    readonly message: string,
    readonly code: number,
    readonly cause?: Error,
  ) {
    super(message, { cause });
  }
}
