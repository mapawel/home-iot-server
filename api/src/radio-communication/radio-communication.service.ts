import Module from '../radio-modules/entity/module';
import RadioService from '../radio-board/radio.service';
import Message from '../radio-board/entities/message.entity';
import ReadingBuilder from '../radio-board/radio-utils/reading-builder.util';
import ModulesService from '../radio-modules/services/modules.service';

class RadioCommunicationService {
  private readonly radio: RadioService;
  private readonly readingBuilder: ReadingBuilder = new ReadingBuilder();
  private readonly modulesService: ModulesService = new ModulesService();

  constructor() {
    this.radio = RadioService.getInstance();
  }

  public async startRadioCommunicationBasedOnDBModules() {
    try {
      const modules: Module[] = await this.modulesService.getModules();
      this.initializePassedModulesReading(modules);
    } catch (err) {
      throw new Error('it will be a domain error from radioCommService');
    }
  }

  public initializePassedModulesReading(modules: Module[]) {
    for (const module of modules) {
      const { pipeAddress } = module;

      this.radio.startReadingAndProceed(
        this.radio.addReadPipe(pipeAddress),
        (messageFragment: string) =>
          this.readingBuilder.getFinalMergedMessage(
            messageFragment,
            (message: Message) => console.log('-> ', message),
          ),
      );
    }
  }
}

export default RadioCommunicationService;
