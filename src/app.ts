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
    const nrfConfig = {
      PALevel: nrf24.RF24_PA_HIGH,
      DataRate: nrf24.RF24_1MBPS,
      Channel: 100,
      CRCLength: nrf24.RF24_CRC_16,
      retriesCount: 10,
      AutoAck: true,
    };
    const address: number = 1099511627775;
    const address2: number = 1099511626675;

    const hexAddress: string = address.toString(16).toUpperCase();
    const hexAddress2: string = address2.toString(16).toUpperCase();
    const paddedHexAddress: string = `0x${hexAddress.padStart(10, '0')}`;
    const paddedHexAddress2: string = `0x${hexAddress2.padStart(10, '0')}`;

    const rf24 = new nrf24.nRF24(17, 0);
    const isRadioBegin: boolean = rf24.begin();

    console.log('is radio begin -> ', isRadioBegin);

    rf24.config(nrfConfig);
    const pipeNo = rf24.addReadPipe(paddedHexAddress);
    const pipeNo2 = rf24.addReadPipe(paddedHexAddress2);
    console.log('is pipe created, no: -> ', pipeNo);
    console.log('is pipe created, no: -> ', pipeNo2);

    console.log('has radio failure -> ', rf24.hasFailure());

    rf24.read(
      function (data: [{ pipe: string; data: Buffer }], frames: number) {
        for (let i = 1; i <= frames; i++) {
          console.log(
            `>>> all frames: ${frames}.`,
            `Frame no ${frames}: `,
            `pipe: ${data[frames - 1]?.pipe}`,
            `DATA: ${data[frames - 1]?.data}`,
            '<<<',
          );
        }
      },
      function (isStopped: unknown, by_user: unknown, error_count: unknown) {
        console.log('RADIO STOPPED! -> ', isStopped, by_user, error_count);
      },
    );

    // const data: Buffer = Buffer.from('Hello mother fucker!');
    // rf24.useWritePipe('0x72646f4e31');
    // const go = () => {
    //   rf24.write(data, function (success: unknown) {
    //     console.log(`++ data sent! Success?: ${success}`);
    //   });
    // };
    // let i = 0;
    //
    // const interval = setInterval(() => {
    //   if (i <= 50) {
    //     go();
    //     i++;
    //   } else {
    //     clearInterval(interval);
    //   }
    // }, 1000);
  }

  public async start() {
    try {
      // await mySQLDataSource.initialize();

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
