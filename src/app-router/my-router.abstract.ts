import { Express, Router } from 'express';

export abstract class MyRouter {
  protected constructor(
    private readonly app: Express,
    readonly router = Router(),
  ) {}

  start() {
    this.app.use(this.router);
  }
}
