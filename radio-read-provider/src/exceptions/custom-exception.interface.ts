import { Level } from '../logger/dict/level.enum';

export interface ICustomException {
  name: string;
  message: string;
  stack?: string;
  cause?: unknown;
  level?: Level;
  details?: unknown;
}
