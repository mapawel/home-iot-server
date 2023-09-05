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
    const address: number = 1099511627775;
    const hexAddress: string = address.toString(16).toUpperCase();
    const paddedHexAddress: string = `0x${hexAddress.padStart(10, '0')}`;
    console.log('paddedHexAddress >>> ', paddedHexAddress);

    const rf24 = new nrf24.nRF24(17, 0);
    const responseOfBeginning: boolean = rf24.begin(true);

    console.log('responseOfBeginning >> ', responseOfBeginning);

    rf24.config(
      {
        PALevel: nrf24.RF24_PA_LOW,
        DataRate: nrf24.RF24_1MBPS,
        Channel: 76,
        CRCLength: nrf24.RF24_CRC_DISABLED,
      },
      true,
    );
    const pipe = rf24.addReadPipe(paddedHexAddress, true);
    console.log('--pipe created, no: -> ', pipe);

    console.log('rf24.present() ? -> ', rf24.present());
    console.log('hasFailure ? -> ', rf24.hasFailure());

    rf24.read(
      function (data: [{ pipe: string; data: Buffer }], n: number) {
        console.log('data: ', data);
        console.log('n: ', n);
        // for (let i = 0; i <= n; i++) {
        //   console.log(
        //     `>>>>> ${n} iter: `,
        //     `pipe: ${data[n - 1]?.pipe}`,
        //     `DATA: ${data[n - 1]?.data}`,
        //   );
        // }
      },
      function (isStopped: unknown, by_user: unknown, error_count: unknown) {
        console.log('RADIO STOPPED! -> ', isStopped, by_user, error_count);
      },
    );

    // const data: Buffer = Buffer.from('Hello mother fucker!');
    // rf24.useWritePipe('0x72646f4e31', true);
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
