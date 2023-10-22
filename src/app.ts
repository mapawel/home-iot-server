import os from 'node:os';
import express, { Express } from 'express';
import Debugger from './app-services/debugger/debugger.service';
import ConfigBuilder from './config-builder/Config-builder';
import AppRouter from './app-router';
import { configType } from './config-builder/config.type';
import SwitchesRouter from './switches/router/switches.router';
import SensorsRouter from './sensors/router/sensors.router';
import Router404 from './exceptions/404/router/404.router';
import ErrorHandling from './exceptions/error-handler';
// import mySQLDataSource from './data-sources/mySQL.data-source';
import RadioService from './radio/radio.service';

const { config }: { config: configType } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || config.server.port;
  private httpDebugger: Debugger = new Debugger('http');
  private appRouter: AppRouter | undefined;
  private radioService: RadioService | undefined;

  // private errorHandling: ErrorHandling = ;

  public async start() {
    try {
      // await mySQLDataSource.initialize();

      this.app.use(this.httpDebugger.debug);

      this.appRouter = new AppRouter(this.app, [
        new SwitchesRouter(),
        new SensorsRouter(),
        new Router404(),
      ]);


      this.radioService = RadioService.getInstance();

      this.radioService.startReadingAndProceed(
        this.radioService.addReadPipe(100),
        (x) => console.log(x),
      );

      new ErrorHandling(this.app);

      await this.app.listen(this.port);
      console.log(`App is listening on ${this.port}`);
    } catch (err) {
      console.warn(`Problem with starting server on port ${this.port}`, err);
    }
  }
}

const server = new Server();

(async () => await server.start())();


// TODO: ts-node-watch or smh, debugger, logging-lib, web-safe, memory-usage
