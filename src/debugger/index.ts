import { NextFunction, Request, Response } from 'express';
import Debug from 'debug';

class Debugger {
  private debug: Debug.Debugger = Debug('http');

  debugFn = (req: Request, _res: Response, next: NextFunction) => {
    this.debug(req.method + ' ' + req.url);
    next();
  };
}

export default Debugger;
