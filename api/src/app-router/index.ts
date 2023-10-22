import { Router, Express, Request, Response } from 'express';
import MyRouter from './my-router.abstract';

class AppRouter {
  constructor(
    private readonly app: Express,
    private readonly routers: MyRouter[],
    private readonly router: Router = Router(),
  ) {
    this.router.get('/ping', (req: Request, res: Response) => {
      return res.status(200).send('pong');
    });

    app.use(this.router);
    this.routers.forEach((myRouter: MyRouter) => myRouter.start(this.app));
  }
}

export default AppRouter;
