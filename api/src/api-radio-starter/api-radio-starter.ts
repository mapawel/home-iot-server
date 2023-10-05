import ModulesService from '../radio-modules/services/modules.service';
import Module from '../radio-modules/entity/module';
import RabbitQueueDataSource from '../data-sources/rbbit-queue.data-source';
import ModuleDtoMapper from '../radio-modules/dto/module-dto.mapper';
import ModuleInternalDto from '../radio-modules/dto/module-internal.dto';

class ApiRadioStarter {
  private readonly modulesService: ModulesService = new ModulesService();
  private readonly rabbitChannelNames = {
    allListenedModules: 'allListenedModules',
  };
  private readonly rabbitQueueDataSource: RabbitQueueDataSource =
    RabbitQueueDataSource.getInstance();

  public async sendAllRadioModulesToStartCommunication() {
    try {
      const modules: Module[] = await this.modulesService.getModules();
      const moduleInternalDtos: ModuleInternalDto[] = modules.map(
        (module: Module) => new ModuleDtoMapper(module).mapModuleForInternal(),
      );

      const moduleDtosString = JSON.stringify([moduleInternalDtos[1]]);

      await this.rabbitQueueDataSource.sendMessage(
        this.rabbitChannelNames.allListenedModules,
        moduleDtosString,
      );
    } catch (err) {
      throw new Error(
        `it will be a domain error from radioCommService: ${err}`,
      );
    }
  }
}

export default ApiRadioStarter;
