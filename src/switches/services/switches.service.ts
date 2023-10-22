import { Request, Response } from 'express';
import { ResponseType } from '../../app-types/response.type';
import { ResponseStatus } from '../../app-types/response-status.enum';
import RabbitQueueDataSource from '../../data-sources/rbbit-queue.data-source';

class SwitchesService {
  rabbit: RabbitQueueDataSource;

  constructor() {
    this.rabbit = RabbitQueueDataSource.getInstance();
  }

  getSwitches(
    req: Request,
    res: Response<ResponseType>,
  ): Response<ResponseType> {
    this.rabbit.startMsgListener('nazwa kolejnki', (x: string) => {
      console.log(`Z RABBITA!: ${x}`);
    });

    return res.status(200).json({
      status: ResponseStatus.OK,
      code: 200,
      message: 'This are all switches',
    });
  }
}

export default SwitchesService;
