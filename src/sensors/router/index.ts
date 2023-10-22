import { Router, Request, Response } from 'express';
import { MyRouter } from '../../app-router/my-router.abstract';
import { mySQLDataSource } from '../../data-sources/mySQL.data-source';
import { AnalogSensor } from '../entity/analog-sensor';
import { RabbitQueueDataSource } from '../../data-sources/rbbit-queue.data-source';

class SensorsRouter extends MyRouter {
  private readonly analogSensorRepository =
    mySQLDataSource.getRepository(AnalogSensor);

  constructor(router = Router()) {
    super(router);

    this.router.get('/sensors', async (req: Request, res: Response) => {
      const queueSoruce: RabbitQueueDataSource =
        RabbitQueueDataSource.getInstance();

      await queueSoruce.startMsgListener('test', (x: string) =>
        console.log('---------', x),
      );

      return res
        .status(200)
        .send(
          'these are sensors... RabbitMQ messages are active, listening ...',
        );
    });
  }
}

export default SensorsRouter;
