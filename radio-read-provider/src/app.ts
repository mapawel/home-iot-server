import express, { Express } from 'express';
import ConfigBuilder from './config-builder/Config-builder';
import { configType } from './config-builder/config.type';
import RadioCommunicationService from './radio-communication/radio-communication.service';
import ApplicationException from './exceptions/application.exception';
import { LogLevel } from './logger/dict/log-level.enum';
import { ExceptionLevel } from './exceptions/dict/exception-level.enum';
import ExceptionManagerService from './exceptions/exception-manager.service';

const { config }: { config: configType } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || config.server.port;
  private readonly exceptionManager: ExceptionManagerService =
    ExceptionManagerService.getInstance();
  private readonly radioCommunicationService: RadioCommunicationService =
    new RadioCommunicationService();

  public async start() {
    try {
      await this.radioCommunicationService.startRadioCommunicationBasedOnRabbitData();

      // process.on('uncaughtException', (error) => {
      //   console.error('Nieprzechwycony błąd:', error);
      //   // Tutaj możesz wykonać odpowiednie akcje w przypadku błędu
      // });

      await this.app.listen(this.port);
      console.log(`App is started, port: ${this.port}`);
    } catch (err) {
      const error = new ApplicationException(
        `Problem with starting the server on port ${this.port}`,
        ExceptionLevel.FATAL,
        { cause: err },
      );
      await this.exceptionManager.logAndThrowException(
        LogLevel.EXCEPTION,
        error,
      );
    }
  }
}

const server = new Server();
(async () => await server.start())();
