import express, { Express } from 'express';
import Debugger from './app-services/debugger/debugger.service';
// @ts-ignore
import * as nrf24 from 'nrf24';
import ConfigBuilder from './config-builder/Config-builder';
import AppRouter from './app-router';
import { configType } from './config-builder/config.type';
import SwitchesRouter from './switches/router/switches.router';
import SensorsRouter from './sensors/router/sensors.router';
import Router404 from './exceptions/404/router/404.router';
import ErrorHandling from './exceptions/error-handler';
import mySQLDataSource from './data-sources/mySQL.data-source';

const { config }: { config: configType } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || config.server.port;
  private httpDebugger: Debugger = new Debugger('http');
  private appRouter: AppRouter | undefined;

  public startRadioForTest() {
    //
    const rf24 = new nrf24.nRF24(17, 8);
    rf24.begin();
    rf24.config({
      PALevel: nrf24.RF24_PA_LOW,
      DataRate: nrf24.RF24_1MBPS,
    });
    const pipe = rf24.addReadPipe('0x65646f4e31', true);

    rf24.read(
      function (data: unknown, n: number) {
        console.log('>>>>>>>>>>>>>>>>>>>> ', data, n);
      },
      function (isStopped: unknown, by_user: unknown, error_count: unknown) {
        console.log('----------', isStopped, by_user, error_count);
      },
    );

    //
  }

  public async start() {
    try {
      await mySQLDataSource.initialize();

      this.app.use(this.httpDebugger.debug);

      this.appRouter = new AppRouter(this.app, [
        new SwitchesRouter(),
        new SensorsRouter(),
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
(async () => {
  await server.start();
  server.startRadioForTest();
})();

// TODO: ts-node-watch or smh, debugger, logging-lib, web-safe, memory-usage
