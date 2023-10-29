import express, { Express } from 'express';
import ConfigBuilder from './config-builder/Config-builder';
import { configType } from './config-builder/config.type';
import RadioCommunicationService from './radio-communication/radio-communication.service';
import ApplicationException from './exceptions/application.exception';
import AppLogger from './loggers/logger-service/logger.service';
import { InfoLog } from './loggers/info-log/info-log.instance';
import { ApplicationExceptionCode } from './exceptions/dict/exception-codes.enum';
import { ErrorLog } from './loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from './loggers/log-level/logger-level.enum';

class Server {
  private readonly config: configType = ConfigBuilder.getInstance().config;
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || this.config.server.port;
  private readonly radioCommunicationService: RadioCommunicationService =
    new RadioCommunicationService();
  private readonly appLogger: AppLogger = AppLogger.getInstance();

  public async start() {
    try {
      await this.radioCommunicationService.startRadioCommunicationBasedOnRabbitData();

      await this.app.listen(this.port);
      this.appLogger.log(new InfoLog(`App is started, port: ${this.port}`));
    } catch (err) {
      const error = new ApplicationException(
        ApplicationExceptionCode.APP_START_ERROR,
        { cause: err },
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
  }
}

const server = new Server();
(async () => {
  await server.start();

  await new Promise((resolve) => setTimeout(resolve, 1000));
  // @ts-ignore
  process.emit('message2', 2);

  await new Promise((resolve) => setTimeout(resolve, 1000));
  // @ts-ignore
  process.emit('message1', 0);

  await new Promise((resolve) => setTimeout(resolve, 1000));
  // @ts-ignore
  process.emit('message3', 3);
})();
