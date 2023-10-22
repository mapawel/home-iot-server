import { HttpException } from './http.exception';

export class UnauthorizedException extends HttpException {
  constructor(
    readonly message: string,
    readonly payload?: { couse?: Error },
  ) {
    super(message, 401, payload?.couse);
  }
}
