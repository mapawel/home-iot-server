import { IErrorLog } from './error-log.interface';
import { LoggerLevelEnum } from '../log-level/logger-level.enum';
import { CustomException } from '../../exceptions/custom-exception.interface';

export class ErrorLog implements IErrorLog {
  readonly name: string;
  readonly message: string;
  readonly code: number;
  readonly cause: unknown;
  readonly details: unknown;
  readonly serializedError: string;
  readonly moduleId?: string;

  constructor(
    readonly error: CustomException,
    readonly level: LoggerLevelEnum,
    readonly additionalData?: unknown,
  ) {
    this.name = error.name;
    this.message = error.message;
    this.code = error.code;
    this.cause = error.cause;
    this.details = error.details;
    this.serializedError = this.getSerializedError(error);
    this.moduleId = error.moduleId;
  }

  private getSerializedError(error: CustomException): string {
    return JSON.stringify(
      this.mapErrorToSerializableObject(error),
      this.errorReplacer,
    );
  }

  private mapErrorToSerializableObject(error: CustomException): object {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      cause: error.cause,
      details: error.details,
      moduleId: error.moduleId,
    };
  }

  private errorReplacer(key: string, value: unknown) {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
        cause: value.cause,
      };
    }
    return value;
  }
}
