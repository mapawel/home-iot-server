import { Express, Request, Response, NextFunction } from 'express';
import { BadRequestException } from '../bad-request.exception';
import { HttpException } from '../http.exception';
import { ResponseStatus } from '../../app-types/response-status.enum';
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

        if (!error?.code)
          return res.status(500).json({
            status: ResponseStatus.ERROR,
            code: 500,
            message: 'Internal server error',
          });

        if (error instanceof BadRequestException)
          return res.status(error.code).json({
            status: ResponseStatus.ERROR,
            code: error.code,
            message: error.message,
            // errors: error.payload.errors,
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
    console.error(
      ' --> APP ERROR: ',
      error instanceof Object ? JSON.stringify(error, null, 2) : error,
      ' <--',
    );
  }
}

export default ErrorHandler;
