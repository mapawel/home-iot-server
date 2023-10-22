import { NextFunction, Router, Request, Response } from 'express';
import MyRouter from '../../../app-router/my-router.abstract';
import { NotFoundException } from '../../not-found.exception';

class Router404 extends MyRouter {
  constructor(router = Router()) {
    super(router);

    this.router.get('*', (req: Request, res: Response, next: NextFunction) => {
      next(new NotFoundException());
    });
  }
}

export default Router404;
