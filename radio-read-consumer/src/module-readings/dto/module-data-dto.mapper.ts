import Module from '../../radio-modules/entity/module';
import DataType from '../types/data.type';

class ModuleDataDtoMapper {
  constructor(
    private readonly data: DataType[],
    private readonly module: Module,
  ) {}

  public mapModuleData() {
    return {
      moduleDbId: this.module.id,
      data: this.data,
    };
  }
}

export default ModuleDataDtoMapper;
