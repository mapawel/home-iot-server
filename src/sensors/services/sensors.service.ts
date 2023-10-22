import { Request, Response } from 'express';
import { ResponseType } from '../../app-types/response.type';
import { ResponseStatus } from '../../app-types/response-status.enum';

class SensorsService {
  getSensors(
    req: Request,
    res: Response<ResponseType>,
  ): Response<ResponseType> {
    return res.status(200).json({
      status: ResponseStatus.OK,
      code: 200,
      message: 'This are all sensors',
    });
  }
}

export default SensorsService;
