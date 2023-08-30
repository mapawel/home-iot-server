import { ResponseStatus } from './response-status.enum';

export type ResponseType = {
  status: ResponseStatus;
  code: number;
  message: string;
  errors?: string[];
  data?: Record<string, string[] | Record<string, string | number>>;
};
