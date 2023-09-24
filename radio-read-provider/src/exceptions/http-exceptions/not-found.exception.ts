import { HttpException } from './http.exception';

export class NotFoundException extends HttpException {
  constructor(readonly payload?: { couse?: Error }) {
    super('Not found asset', 404, payload?.couse);
  }
}
