import { HttpException } from './http.exception';

// import { ValidationError } from "class-validator";

export class BadRequestException extends HttpException {
  // constructor(readonly payload: { errors: ValidationError[]; couse?: Error }) {
  //   super("Bad request / validation failed", 400, payload.couse);
  // }
}
