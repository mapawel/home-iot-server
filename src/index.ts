import express, { Express } from 'express';
import Debugger from './debugger';

import { ConfigBuilder } from './config-builder/Config-builder';
import AppRouter from './app-router';
import { config } from './config-builder/config.type';
import SwitchesRouter from './switches/router';
import SensorsRouter from './sensors/router';

const { config }: { config: config } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || config.server.port;
  private httpDebugger: Debugger = new Debugger('http');
  private appRouter: AppRouter | undefined;

  public async start() {
    try {
      this.app.use(this.httpDebugger.debugHttpFn);

      this.appRouter = new AppRouter(this.app, [
        new SwitchesRouter(this.app),
        new SensorsRouter(this.app),
      ]);

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
