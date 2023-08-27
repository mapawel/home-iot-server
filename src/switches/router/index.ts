import { Router, Request, Response } from 'express';
import { MyRouter } from '../../app-router/my-router.abstract';
import { RabbitQueueDataSource } from '../../data-sources/rbbit-queue.data-source';

class SwitchesRouter extends MyRouter {
  constructor(router = Router()) {
    super(router);

    this.router.get('/switches', async (req: Request, res: Response) => {
      const queueSoruce: RabbitQueueDataSource =
        RabbitQueueDataSource.getInstance();

      queueSoruce.sendMessage('test', 'Tes msg!');

      return res.status(200).send('these are switches route');
    });
  }
}

export default SwitchesRouter;
