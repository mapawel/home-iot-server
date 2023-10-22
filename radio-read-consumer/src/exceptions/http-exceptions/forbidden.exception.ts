import { HttpException } from './http.exception';

export class ForbiddenException extends HttpException {
  constructor(
    readonly message: string,
    readonly payload?: { couse?: Error },
  ) {
    super(message, 403, payload?.couse);
  }
}
