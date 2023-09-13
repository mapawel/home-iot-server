import mySQLDataSource from '../../data-sources/mySQL.data-source';
import { Repository } from 'typeorm';
import Module from '../entity/module';
import CreateModuleReqDto from '../dto/create-module-req.dto';

class ModulesService {
  private readonly moduleRepository: Repository<Module> =
    mySQLDataSource.getRepository(Module);

  constructor() {}

  async getModules(): Promise<Module[]> {
    return await this.moduleRepository.find({});
  }

  async addModule(newModuleCreateEntity: CreateModuleReqDto): Promise<Module> {
    return await this.moduleRepository.save({
      ...newModuleCreateEntity,
      addedAt: new Date(),
    });
  }
}

export default ModulesService;
