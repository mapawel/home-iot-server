import express, { Express } from 'express';
import ConfigBuilder from './config-builder/Config-builder';
import { configType } from './config-builder/config.type';
import mySQLDataSource from './data-sources/sql/mySQL.data-source';
import ApplicationException from './exceptions/application.exception';
import AppLogger from './loggers/logger-service/logger.service';
import { ApplicationExceptionCode } from './exceptions/dict/exception-codes.enum';
import { ErrorLog } from './loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from './loggers/log-level/logger-level.enum';
import RabbitQueueDataSource from './data-sources/rabbit/rabbit-queue.data-source';
import { ModuleMessageHandler } from './data-sources/rabbit/rabbit-handlers/module.message-handler';
import { RabbitChannelNames } from './data-sources/rabbit/rabbit-channel-names.enum';

class Server {
  private readonly config: configType = ConfigBuilder.getInstance().config;
  private readonly appLogger: AppLogger = AppLogger.getInstance();
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || this.config.server.port;
  private readonly rabbitQueueDataSource: RabbitQueueDataSource =
    new RabbitQueueDataSource(new ModuleMessageHandler());

  public async start() {
    try {
      await mySQLDataSource.initialize();

      await this.rabbitQueueDataSource.startMsgListener(
        RabbitChannelNames.MESSAGES,
      );

      await this.app.listen(this.port);
      console.log(`App is listening on ${this.port}`);
    } catch (err) {
      const error = new ApplicationException(
        ApplicationExceptionCode.APP_START_ERROR,
        { cause: err },
      );
      this.appLogger.log(
        new ErrorLog(error, LoggerLevelEnum.ERROR, { port: this.port }),
      );
      throw error;
    }
  }
}

const server = new Server();
(async () => await server.start())();
