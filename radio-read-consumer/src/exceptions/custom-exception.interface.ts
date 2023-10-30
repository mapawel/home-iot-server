export interface CustomException {
  name: string;
  message: string;
  code: number;
  cause: unknown;
  details: unknown;
  moduleId?: string;
}
