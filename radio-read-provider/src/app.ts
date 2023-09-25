import express, { Express, json } from 'express';
import Debugger from './app-services/debugger/debugger.service';
import ConfigBuilder from './config-builder/Config-builder';
import { configType } from './config-builder/config.type';
import RadioCommunicationService from './radio-communication/radio-communication.service';

const { config }: { config: configType } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || config.server.port;
  private httpDebugger: Debugger = new Debugger('http');
  private radioCommunicationService: RadioCommunicationService =
    new RadioCommunicationService();

  public async start() {
    try {
      this.app.use(this.httpDebugger.debug);

      await this.radioCommunicationService.startRadioCommunicationBasedOnRabbitData();

      await this.app.listen(this.port);
      console.log(`App is started, port: ${this.port}`);
    } catch (err) {
      console.warn(`Problem with starting server on port ${this.port}`, err);
    }
  }
}

const server = new Server();
(async () => await server.start())();

// TODO: ts-node-watch or smh, debugger, logging-lib, web-safe, memory-usage
