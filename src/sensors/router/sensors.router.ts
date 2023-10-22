import { Router, Request, Response } from 'express';
import MyRouter from '../../app-router/my-router.abstract';
import SensorsService from '../services/sensors.service';
// import mySQLDataSource from '../../data-sources/mySQL.data-source';
// import AnalogSensor from '../entity/analog-sensor';

class SensorsRouter extends MyRouter {
  // private readonly analogSensorRepository =
  //   mySQLDataSource.getRepository(AnalogSensor);

  private readonly sensorService: SensorsService = new SensorsService();

  constructor(router = Router()) {
    super(router);

    this.router.get('/sensors', (req: Request, res: Response) =>
      this.sensorService.getSensors(req, res),
    );
  }
}

export default SensorsRouter;
