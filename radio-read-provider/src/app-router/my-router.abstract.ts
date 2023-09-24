import { Express, Router } from 'express';

abstract class MyRouter {
  protected constructor(readonly router = Router()) {}

  start(app: Express) {
    app.use(this.router);
  }
}

export default MyRouter;
