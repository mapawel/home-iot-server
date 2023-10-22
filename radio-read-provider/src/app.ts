import express, { Express } from 'express';
import ConfigBuilder from './config-builder/Config-builder';
import { configType } from './config-builder/config.type';
import RadioCommunicationService from './radio-communication/radio-communication.service';
import ApplicationException from './exceptions/application.exception';
import { Level } from './logger/dict/level.enum';
import LoggerService from './logger/logger.service';
import Log from './logger/log.entity';

const { config }: { config: configType } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || config.server.port;
  private readonly radioCommunicationService: RadioCommunicationService =
    new RadioCommunicationService();
  private readonly loggerService: LoggerService = LoggerService.getInstance();

  public async start() {
    try {
      this.loggerService.initSentry(this.app);

      await this.radioCommunicationService.startRadioCommunicationBasedOnRabbitData();

      await this.app.listen(this.port);
      this.loggerService.logInfo(
        new Log({ message: `App is started, port: ${this.port}` }),
      );
    } catch (err) {
      const error = new ApplicationException(
        `Problem with starting the server on port ${this.port}`,
        Level.FATAL,
        { cause: err },
      );
      this.loggerService.logError(new Log(error));
    }
  }
}

const server = new Server();
(async () => await server.start())();
