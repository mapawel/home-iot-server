import { Request, Response } from 'express';
import { ResponseType } from '../../app-types/response.type';
import { ResponseStatus } from '../../app-types/response-status.enum';
import RabbitQueueDataSource from '../../data-sources/rbbit-queue.data-source';

class SensorsService {
  rabbit: RabbitQueueDataSource;

  constructor() {
    this.rabbit = RabbitQueueDataSource.getInstance();
  }

  getSensors(
    req: Request,
    res: Response<ResponseType>,
  ): Response<ResponseType> {
    this.rabbit.sendMessage('nazwa kolejnki', 'wiadomość 33');

    return res.status(200).json({
      status: ResponseStatus.OK,
      code: 200,
      message: 'This are all sensors',
    });
  }
}

export default SensorsService;
