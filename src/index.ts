import express, { Express, Request, Response } from 'express';

import { ConfigBuilder } from './config-builder/Config-builder';
import { config } from './config-builder/config.type';
import Debugger from './debugger';

const { config }: { config: config } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || config.server.port;
  private httpDebugger = new Debugger('http');

  public async start() {
    try {
      this.app.use(this.httpDebugger.debugHttpFn);

      this.app.get('/', (req: Request, res: Response) =>
        res.json({ status: 'ok' }),
      );

      await this.app.listen(this.port);
      console.log(`App is listening on ${this.port}`);
    } catch (err) {
      console.warn(`Problem with starting server on port ${this.port}`);
    }
  }
}

const server = new Server();
(async () => await server.start())();

// TODO: ts-node-watch or smh, debugger, logging-lib, web-safe, memory-usage
