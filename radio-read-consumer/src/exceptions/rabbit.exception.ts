import { Level } from '../logger/dict/level.enum';
import {
  RabbitExceptionMap,
  RabbitExceptionMapValue,
} from './dict/exception-maps';
import { RabbitExceptionCode } from './dict/exception-codes.enum';
import { ICustomException } from './custom-exception.interface';

class RabbitException extends Error implements ICustomException {
  readonly name: 'RABBIT EXCEPTION';
  readonly details: RabbitExceptionMapValue;

  constructor(
    code: RabbitExceptionCode,
    readonly level: Level,
    options?: { cause: unknown },
  ) {
    super('RABBIT EXCEPTION', {
      cause: options?.cause,
    });
    this.details = RabbitExceptionMap[code];
  }
}

export default RabbitException;
