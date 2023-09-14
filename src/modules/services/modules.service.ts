import mySQLDataSource from '../../data-sources/mySQL.data-source';
import { Repository, QueryFailedError } from 'typeorm';
import Module from '../entity/module';
import CreateModuleReqDto from '../dto/create-module-req.dto';
import { BadRequestException } from '../../exceptions/http-exceptions/bad-request.exception';
import { ValidationError } from 'class-validator';
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
        throw new InternalServiceException(err.driverError);
      throw new InternalServiceException('Exception in getModules()');
    }
  }

  async addModule(newModuleCreateEntity: CreateModuleReqDto): Promise<Module> {
    try {
      throw new Error('ha');
      return await this.moduleRepository.save({
        ...newModuleCreateEntity,
        addedAt: new Date(),
      });
    } catch (err: unknown) {
      if (err instanceof QueryFailedError)
        throw new InternalServiceException(err.driverError);
      throw new InternalServiceException('Exception in assModule()');
    }
  }
}

export default ModulesService;
