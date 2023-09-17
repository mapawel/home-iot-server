import express, { Express, json } from 'express';
import Debugger from './app-services/debugger/debugger.service';
import ConfigBuilder from './config-builder/Config-builder';
import AppRouter from './app-router';
import { configType } from './config-builder/config.type';
import ModulesRouter from './modules/router/modules.router';
import Router404 from './exceptions/404/router/404.router';
import ErrorHandling from './exceptions/error-handler';
import mySQLDataSource from './data-sources/mySQL.data-source';
import RadioCommunicationService from './radio-communication/radio-communication.service';
// import RadioValidationService from './radio-validation/radio-validation.service';
// import fastKeysService from './fast-keys/fast-keys.service';
// import FastKeysService from './fast-keys/fast-keys.service';

const { config }: { config: configType } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || config.server.port;
  private httpDebugger: Debugger = new Debugger('http');
  private appRouter: AppRouter | undefined;
  private radioCommunicationService: RadioCommunicationService =
    new RadioCommunicationService();

  public async start() {
    try {
      await mySQLDataSource.initialize();

      this.app.use(json());
      this.app.use(this.httpDebugger.debug);

      await this.radioCommunicationService.startRadioCommunicationBasedOnDBModules();

      this.appRouter = new AppRouter(this.app, [
        new ModulesRouter(),
        new Router404(),
      ]);

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
