import mySQLDataSource from '../../data-sources/mySQL.data-source';
import { Repository, QueryFailedError } from 'typeorm';
import Module from '../entity/module';
import CreateModuleReqDto from '../dto/create-module-req.dto';
import { BadRequestException } from '../../exceptions/http-exceptions/bad-request.exception';
import { InternalServiceException } from '../../exceptions/internal-services-exceptions/internal-service.exception';

class ModulesService {
  private readonly moduleRepository: Repository<Module> =
    mySQLDataSource.getRepository(Module);

  constructor() {}

  async getModules(): Promise<Module[]> {
    try {
      return await this.moduleRepository.find({});
    } catch (err: unknown) {
      if (err instanceof QueryFailedError)
        throw new BadRequestException({ errors: [err.driverError] });
      throw new InternalServiceException('Exception in getModules()');
    }
  }

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
        throw new BadRequestException({ errors: [err.driverError] });
      throw new InternalServiceException('Exception in getModules()');
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
        throw new BadRequestException({ errors: [err.driverError] });
      throw new InternalServiceException('Exception in getModules()');
    }
  }

  async addModule(newModuleCreateEntity: CreateModuleReqDto): Promise<Module> {
    try {
      return await this.moduleRepository.save({
        ...newModuleCreateEntity,
        addedAt: new Date(),
      });
    } catch (err: unknown) {
      if (err instanceof QueryFailedError)
        throw new BadRequestException({ errors: [err.driverError] });
      throw new InternalServiceException('Exception in addModule()');
    }
  }
}

export default ModulesService;
