import express, { Express } from 'express';
import ConfigBuilder from './config-builder/Config-builder';
import { configType } from './config-builder/config.type';
import mySQLDataSource from './data-sources/mySQL.data-source';
import ApplicationException from './exceptions/application.exception';
import AppLogger from './loggers/logger-service/logger.service';
import { ApplicationExceptionCode } from './exceptions/dict/exception-codes.enum';
import { ErrorLog } from './loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from './loggers/log-level/logger-level.enum';
import ModuleReadingsPersistService from './module-readings/service/module-readings-persist.service';
import ModuleReadingBase from './module-readings/entity/module-reading-base';
import ReadingTypeField from './reading-types/types/reading-field.type';
import ModuleReadingNumber from './module-readings/entity/module-reading-number';
import ModuleReadingBool from './module-readings/entity/module-reading-bool';
import MessageValidateReadService from './module-readings/service/message-validate-read.service';
import ReadModuleDataDto from './module-readings/dto/read-module-data.dto';

class Server {
  private readonly config: configType = ConfigBuilder.getInstance().config;
  private readonly appLogger: AppLogger = AppLogger.getInstance();
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || this.config.server.port;

  public async start() {
    try {
      await mySQLDataSource.initialize();

      // for manual tests if these services can decrypt message and save to DB
      const moduleReadingsPersistService =
        new ModuleReadingsPersistService<ModuleReadingBase>([
          {
            readingFieldType: ReadingTypeField.NUMBER,
            repository: mySQLDataSource.getRepository(ModuleReadingNumber),
          },
          {
            readingFieldType: ReadingTypeField.BOOLEAN,
            repository: mySQLDataSource.getRepository(ModuleReadingBool),
          },
        ]);

      const messageValidateReadService = new MessageValidateReadService();
      messageValidateReadService.decryptAndReturnValidatedObject(
        {
          moduleId: '039e60c874a',
          encryptedData:
            '9HCO6rzyO7iJsemL8cUijXlJhhbyGak/0yI6H4MRuXJb8kero1iGo2o93URcopxPTtOyvvE8F4P80I+qPmGtYQ==',
          hash: 'cdc49bbbd1b81891a5e7ddd7abb61e1162bbcea4d5c8dc0feed6950565d2025d',
        },
        (data: ReadModuleDataDto) => {
          console.log('GO!', data);
          moduleReadingsPersistService.saveReadings(data);
        },
      );
      // end

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
