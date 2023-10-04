import { ExceptionLevel } from './dict/exception-level.enum';

export interface ICustomException {
  message: string;
  name: string;
  stack?: string;
  cause?: unknown;
  level?: ExceptionLevel;
  data?: unknown;
}
