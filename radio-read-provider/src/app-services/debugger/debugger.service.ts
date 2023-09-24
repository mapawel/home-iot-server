import { NextFunction, Request, Response } from 'express';
import Debug from 'debug';

class Debugger {
  private readonly debugger: Debug.Debugger;

  constructor(name: string) {
    this.debugger = Debug(name);
  }

  debug = (req: Request, _res: Response, next: NextFunction) => {
    this.debugger(req.method + ' ' + req.url);
    next();
  };
}

export default Debugger;
