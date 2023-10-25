import express, { Express } from 'express';
import ConfigBuilder from './config-builder/Config-builder';
import { configType } from './config-builder/config.type';
import mySQLDataSource from './data-sources/mySQL.data-source';
import LoggerService from './logger/logger.service';
import ApplicationException from './exceptions/application.exception';
import { Level } from './logger/dict/level.enum';
import Log from './logger/log.entity';
import ModuleReadingsPersistService from './module-readings/service/module-readings-persist.service';
import ModuleReadingBase from './module-readings/entity/module-reading-base';
import ReadingTypeField from './reading-types/types/reading-field.type';
import ModuleReadingNumber from './module-readings/entity/module-reading-number';
import ModuleReadingBool from './module-readings/entity/module-reading-bool';

const { config }: { config: configType } = ConfigBuilder.getInstance();

class Server {
  private readonly app: Express = express();
  private port: number = Number(process.env.PORT) || config.server.port;
  private readonly loggerService: LoggerService = LoggerService.getInstance();

  public async start() {
    try {
      this.loggerService.initSentry(this.app);

      await mySQLDataSource.initialize();

      const radioModuleReadingsService =
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

      await this.app.listen(this.port);
      console.log(`App is listening on ${this.port}`);
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
