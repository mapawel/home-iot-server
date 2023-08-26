import { Router, Request, Response } from 'express';
import { MyRouter } from '../../app-router/my-router.abstract';
import { mySQLDataSource } from '../../data-sources/mySQL.data-source';
import { AnalogSensor } from '../entity/analog-sensor';

class SensorsRouter extends MyRouter {
  private readonly analogSensorRepository =
    mySQLDataSource.getRepository(AnalogSensor);

  constructor(router = Router()) {
    super(router);

    this.router.get('/sensors', async (req: Request, res: Response) => {
      return res.status(200).send('these are sensors');
    });
  }
}

export default SensorsRouter;
