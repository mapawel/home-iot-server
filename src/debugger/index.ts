import { NextFunction, Request, Response } from 'express';
import Debug from 'debug';

class Debugger {
  private readonly debug: Debug.Debugger;

  constructor(name: string) {
    this.debug = Debug(name);
  }

  debugHttpFn = (req: Request, _res: Response, next: NextFunction) => {
    this.debug(req.method + ' ' + req.url);
    next();
  };
}

export default Debugger;
