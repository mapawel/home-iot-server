import express, { Express } from 'express';
import ConfigBuilder from './config-builder/Config-builder';
import { configType } from './config-builder/config.type';
import ApplicationException from './exceptions/application.exception';
import AppLogger from './loggers/logger-service/logger.service';
import { InfoLog } from './loggers/info-log/info-log.instance';
import { ApplicationExceptionCode } from './exceptions/dict/exception-codes.enum';
import { ErrorLog } from './loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from './loggers/log-level/logger-level.enum';
import RabbitQueueDataSource from './data-sources/rabbit/rabbit-queue.data-source';
import { RabbitChannelNames } from './data-sources/rabbit/rabbit-channel-names.enum';
import { ModulesDataMessageHandler } from './data-sources/rabbit/rabbit-handlers/modules-data-message/modules-data.message-handler';

// import { ModuleMessageHandler } from './rabbit-handlers/module-message/module.message-handler';

class Server {
  private readonly config: configType = ConfigBuilder.getInstance().config;
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || this.config.server.port;
  private readonly appLogger: AppLogger = AppLogger.getInstance();
  private readonly rabbitQueueDataSource: RabbitQueueDataSource =
    new RabbitQueueDataSource(new ModulesDataMessageHandler());

  public async start() {
    try {
      await this.rabbitQueueDataSource.startMsgListener(
        RabbitChannelNames.ALL_LISTENED_MODULES,
      );

      // const rabbitQueueDataSource = new RabbitQueueDataSource(
      //   new ModuleMessageHandler(),
      // );
      // await rabbitQueueDataSource.sendMessage(
      //   RabbitChannelNames.MESSAGES,
      //   '{"moduleId":"039e60c874a","encryptedData":"9HCO6rzyO7iJsemL8cUijXlJhhbyGak/0yI6H4MRuXJb8kero1iGo2o93URcopxPTtOyvvE8F4P80I+qPmGtYQ==","hash":"cdc49bbbd1b81891a5e7ddd7abb61e1162bbcea4d5c8dc0feed6950565d2025d"}',
      // );

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
})();
