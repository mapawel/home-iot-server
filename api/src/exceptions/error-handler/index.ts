import { Express, Request, Response, NextFunction } from 'express';
import { BadRequestException } from '../http-exceptions/bad-request.exception';
import { HttpException } from '../http-exceptions/http.exception';
import {
  ResponseCode,
  ResponseStatus,
} from '../../app-types/response-status.enum';
import { ResponseType } from '../../app-types/response.type';

class ErrorHandler {
  constructor(app: Express) {
    app.use(
      (
        error: HttpException,
        req: Request,
        res: Response<ResponseType>,
        _next: NextFunction,
      ): Response<ResponseType> => {
        this.logErrorToConsole(error);

        if (!error?.code || error.code === ResponseCode.INTERNAL_EXCEPTION)
          return res.status(ResponseCode.INTERNAL_EXCEPTION).json({
            status: ResponseStatus.ERROR,
            code: ResponseCode.INTERNAL_EXCEPTION,
            message: 'Internal server error',
          });

        if (error instanceof BadRequestException)
          return res.status(error.code).json({
            status: ResponseStatus.ERROR,
            code: error.code,
            message: error.message,
            errors: error.payload.errors,
          });

        return res.status(error.code).json({
          status: ResponseStatus.ERROR,
          code: error.code,
          message: error.message,
        });
      },
    );
  }

  private logErrorToConsole(error: HttpException) {
    console.error(' --> APP ERROR: ', error, ' <--');
  }
}

export default ErrorHandler;
