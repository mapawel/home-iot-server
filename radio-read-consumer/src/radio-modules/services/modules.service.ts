import mySQLDataSource from '../../data-sources/mySQL.data-source';
import { Repository, QueryFailedError, UpdateResult } from 'typeorm';
import Module from '../entity/module';

// import CreateModuleReqDto from '../dto/create-module-req.dto';

class ModulesService {
  private readonly moduleRepository: Repository<Module> =
    mySQLDataSource.getRepository(Module);

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
      if (err instanceof QueryFailedError)
        throw new Error('validation error', { cause: [err.driverError] });
      throw new Error('Exception in getModules()');
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
      if (err instanceof QueryFailedError)
        throw new Error('validation error', { cause: [err.driverError] });
      throw new Error('Exception in updateModules()');
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
      if (err instanceof QueryFailedError)
        throw new Error('validation error', { cause: [err.driverError] });
      throw new Error('Exception in updateModuleReading()');
    }
  }
}

export default ModulesService;
