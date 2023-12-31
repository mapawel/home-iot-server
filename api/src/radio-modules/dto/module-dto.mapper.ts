import Module from '../entity/module';
import ModuleResponseDto from './module-response.dto';
import ModuleInternalDto from './module-internal.dto';

class ModuleDtoMapper {
  private readonly moduleId: string;
  private readonly name: string;
  private readonly pipeAddress: number;
  private readonly lastReadDate: Date;
  private readonly lastWriteDate: Date;
  private readonly addedAt: Date;
  private readonly updatedAt: Date;

  constructor(module: Module) {
    this.moduleId = module.moduleId;
    this.name = module.name;
    this.pipeAddress = module.pipeAddress;
    this.lastReadDate = module.lastReadDate;
    this.lastWriteDate = module.lastWriteDate;
    this.addedAt = module.addedAt;
    this.updatedAt = module.updatedAt;
  }

  public mapModuleForResponse(): ModuleResponseDto {
    return {
      moduleId: this.moduleId,
      name: this.name,
      pipeAddress: this.pipeAddress,
      lastReadDate: this.lastReadDate,
      lastWriteDate: this.lastWriteDate,
      addedAt: this.addedAt,
      updatedAt: this.updatedAt,
    };
  }

  public mapModuleForInternal(): ModuleInternalDto {
    return {
      moduleId: this.moduleId,
      name: this.name,
      pipeAddress: this.pipeAddress,
      lastReadDate: this.lastReadDate,
      lastWriteDate: this.lastWriteDate,
    };
  }
}

export default ModuleDtoMapper;
