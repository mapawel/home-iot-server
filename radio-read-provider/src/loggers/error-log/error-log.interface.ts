import { LoggerLevelEnum } from '../log-level/logger-level.enum';
import { CustomException } from '../../exceptions/custom-exception.interface';

export interface IErrorLog {
  error: CustomException;
  level: LoggerLevelEnum;
  name: string;
  message: string;
  code: number;
  cause: unknown;
  details: unknown;
  serializedError: string;
  moduleId?: string;
  additionalData?: unknown;
}
