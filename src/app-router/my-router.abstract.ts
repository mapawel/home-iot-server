import { Express, Router } from 'express';

export abstract class MyRouter {
  protected constructor(readonly router = Router()) {}

  start(app: Express) {
    app.use(this.router);
  }
}
