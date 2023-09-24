import { ResponseStatus } from './response-status.enum';
import ModuleResponseDto from '../radio-modules/dto/module-response.dto';
import { ValidationError } from 'class-validator';

export type ResponseType = {
  status: ResponseStatus;
  code: number;
  message: string;
  errors?: ValidationError[];
  data?: Record<
    string,
    string[] | Record<string, string | number> | ModuleResponseDto[]
  >;
};
