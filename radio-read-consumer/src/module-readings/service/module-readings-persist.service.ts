import { Repository } from 'typeorm';
import ReadModuleDataDto from '../dto/read-module-data.dto';
import ReadingFieldType from '../../reading-types/types/reading-field.type';
import ReadingsEnrichedData from '../types/readings-enriched-data.type';
import { ReadingRepositoryListElement } from '../types/repository-list-element.type';
import ModuleReadingBase from '../entity/module-reading-base';
import ModulesService from '../../radio-modules/services/modules.service';
import ValidationException from '../../exceptions/validation.exception';
import {
  SqlExceptionCode,
  ValidationExceptionCode,
} from '../../exceptions/dict/exception-codes.enum';
import { ErrorLog } from '../../loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from '../../loggers/log-level/logger-level.enum';
import AppLogger from '../../loggers/logger-service/logger.service';
import SqlException from '../../exceptions/sql.exception';

class ModuleReadingsPersistService<T extends ModuleReadingBase> {
  private readonly moduleService: ModulesService = new ModulesService();
  private readonly dataTypesRepositories: Map<ReadingFieldType, Repository<T>> =
    new Map();
  private readonly appLogger: AppLogger = AppLogger.getInstance();

  constructor(repositoriesList: ReadingRepositoryListElement<T>[]) {
    repositoriesList.forEach(
      (el: { readingFieldType: ReadingFieldType; repository: Repository<T> }) =>
        this.dataTypesRepositories.set(el.readingFieldType, el.repository),
    );
  }

  public async saveReadings(readModuleDataDto: ReadModuleDataDto) {
    try {
      const { moduleDbId, lastReadDate, data } = readModuleDataDto;
      for (const dataElement of data) {
        const { reading, type, readingTypeDbId }: ReadingsEnrichedData =
          dataElement;

        const repoForDataType: Repository<T> | undefined =
          this.dataTypesRepositories.get(type);
        if (!repoForDataType)
          throw new Error(
            `not repository fot data of type: ${type} supplied to RadioModuleReadingServide`,
          );
        await repoForDataType.save({
          reading,
          addedAt: new Date(),
          module: { id: moduleDbId },
          readingType: { id: readingTypeDbId },
        } as unknown as T);
      }
      await this.moduleService.updateModuleById(moduleDbId, {
        lastReadDate,
      });
    } catch (err) {
      const error = new SqlException(SqlExceptionCode.DB_INSERT_ERROR, {
        cause: err,
      });
      this.appLogger.log(
        new ErrorLog(error, LoggerLevelEnum.ERROR, { readModuleDataDto }),
      );
      throw error;
    }
  }
}

export default ModuleReadingsPersistService;
