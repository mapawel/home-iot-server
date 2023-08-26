import { Router, Request, Response } from 'express';
import { MyRouter } from '../../app-router/my-router.abstract';

class SwitchesRouter extends MyRouter {
  constructor(router = Router()) {
    super(router);

    this.router.get('/switches', (req: Request, res: Response) => {
      return res.status(200).send('these are switches');
    });
  }
}

export default SwitchesRouter;
