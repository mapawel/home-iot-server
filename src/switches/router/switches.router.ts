import { Router, Request, Response } from 'express';
import MyRouter from '../../app-router/my-router.abstract';
import SwitchesService from '../services/switches.service';

class SwitchesRouter extends MyRouter {
  private readonly switchesService: SwitchesService = new SwitchesService();

  constructor(router = Router()) {
    super(router);

    this.router.get('/switches', (req: Request, res: Response) =>
      this.switchesService.getSwitches(req, res),
    );
  }
}

export default SwitchesRouter;
