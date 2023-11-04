import mySQLDataSource from '../../data-sources/sql/mySQL.data-source';
import { Repository, QueryFailedError, UpdateResult } from 'typeorm';
import Module from '../entity/module';
import { SqlExceptionCode } from '../../exceptions/dict/exception-codes.enum';
import { ErrorLog } from '../../loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from '../../loggers/log-level/logger-level.enum';
import SqlException from '../../exceptions/sql.exception';
import AppLogger from '../../loggers/logger-service/logger.service';

// import CreateModuleReqDto from '../dto/create-module-req.dto';

class ModulesService {
  private readonly moduleRepository: Repository<Module> =
    mySQLDataSource.getRepository(Module);
  private readonly appLogger: AppLogger = AppLogger.getInstance();

  constructor() {}

  // async getModules(): Promise<Module[]> {
  //   try {
  //     return await this.moduleRepository.find({});
  //   } catch (err: unknown) {
  //     if (err instanceof QueryFailedError)
  //       throw new BadRequestException({ errors: [err.driverError] });
  //     throw new InternalServiceException('Exception in getModules()');
  //   }
  // }

  async getModuleByModuleId(moduleId: string): Promise<Module | null> {
    try {
      // todo add indexes for moduleId
      return await this.moduleRepository
        .createQueryBuilder('module')
        .leftJoinAndSelect('module.readingTypes', 'readingType')
        .where('module.moduleId = :moduleId', { moduleId })
        .getOne();
    } catch (err: unknown) {
      let cause = null;
      if (err instanceof QueryFailedError) {
        cause = err.driverError;
      }
      const error = new SqlException(
        SqlExceptionCode.DB_READ_ERROR,
        {
          cause: cause || err,
        },
        moduleId,
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
  }

  async updateModule(
    moduleToUpdate: Module,
    updateData: Partial<Module>,
  ): Promise<void> {
    try {
      const updatedModule: Module = {
        ...moduleToUpdate,
        ...updateData,
      };
      await this.moduleRepository.save(updatedModule);
    } catch (err: unknown) {
      let cause = null;
      if (err instanceof QueryFailedError) {
        cause = err.driverError;
      }
      const error = new SqlException(
        SqlExceptionCode.DB_UPDATE_ERROR,
        {
          cause: cause || err,
        },
        moduleToUpdate.moduleId,
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
  }

  async updateModuleById(
    moduleDbId: number,
    updateData: Partial<Module>,
  ): Promise<void> {
    try {
      const { affected }: UpdateResult = await this.moduleRepository.update(
        {
          id: moduleDbId,
        },
        updateData,
      );
      if (affected !== 1) {
        throw new Error('could not update');
      }
    } catch (err: unknown) {
      let cause = null;
      if (err instanceof QueryFailedError) {
        cause = err.driverError;
      }
      const error = new SqlException(SqlExceptionCode.DB_UPDATE_ERROR, {
        cause: cause || err,
      });
      this.appLogger.log(
        new ErrorLog(error, LoggerLevelEnum.ERROR, {
          moduleDbId,
        }),
      );
      throw error;
    }
  }
}

export default ModulesService;
