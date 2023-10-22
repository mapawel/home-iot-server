import express, { Express, json } from 'express';
import Debugger from './app-services/debugger/debugger.service';
import ConfigBuilder from './config-builder/Config-builder';
import AppRouter from './app-router';
import { configType } from './config-builder/config.type';
import ModulesRouter from './radio-modules/router/modules.router';
import Router404 from './exceptions/404/router/404.router';
import ErrorHandling from './exceptions/error-handler';
import mySQLDataSource from './data-sources/mySQL.data-source';
import ApiRadioStarter from './api-radio-starter/api-radio-starter';

const { config }: { config: configType } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private readonly port: number =
    Number(process.env.PORT) || config.server.port;
  private readonly httpDebugger: Debugger = new Debugger('http');
  private appRouter: AppRouter | undefined;
  private readonly apiRadioStarter: ApiRadioStarter = new ApiRadioStarter();

  public async start() {
    try {
      await mySQLDataSource.initialize();

      this.app.use(json());
      this.app.use(this.httpDebugger.debug);

      await this.apiRadioStarter.sendAllRadioModulesToStartCommunication();

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
