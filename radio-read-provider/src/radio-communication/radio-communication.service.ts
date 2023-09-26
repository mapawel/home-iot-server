import RadioService from '../radio-board/radio.service';
import Message from './entities/message.entity';
import ReadingBuilder from './radio-utils/reading-builder.util';
import ModuleInternalDto from './dto/module-internal.dto';
import RabbitQueueDataSource from '../data-sources/rbbit-queue.data-source';
import { plainToInstance } from 'class-transformer';
import ModuleInternal from './entities/module-internal.entity';

class RadioCommunicationService {
  private readonly radio: RadioService = RadioService.getInstance();
  private readonly readingBuilder: ReadingBuilder = new ReadingBuilder();
  private readonly rabbitChannelNames = {
    allListenedModules: 'allListenedModules',
    messages: 'messages',
  };
  private readonly rabbitQueueDataSource: RabbitQueueDataSource =
    RabbitQueueDataSource.getInstance();
  private modulesToListen: ModuleInternal[] = [];

  constructor() {}

  public async startRadioCommunicationBasedOnRabbitData() {
    try {
      await this.initializeRabbitQueues();

      await this.rabbitQueueDataSource.startMsgListener(
        this.rabbitChannelNames.allListenedModules,
        async (messageWithModules: string) =>
          await this.parseValidateSetModulesToListen(messageWithModules),
      );
    } catch (err) {
      throw new Error(
        `it will be a domain error from radioCommService: ${err}`,
      );
    }
  }

  private initializePassedModulesReading() {
    for (const module of this.modulesToListen) {
      const { pipeAddress } = module;
      console.log(`! ! ! module ${module.name} started to listen!`);
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

  private async parseValidateSetModulesToListen(
    messageWithModules: string,
  ): Promise<void> {
    const parsedModules: ModuleInternalDto[] = JSON.parse(
      messageWithModules,
    ) as unknown as ModuleInternalDto[];
    // to log to exteral service
    console.log(
      'received all modules via Rabbit from DB from API: ',
      parsedModules,
    );
    if (parsedModules) {
      const moduleInstances: ModuleInternal[] =
        this.createInstancesAndValidate(parsedModules);
      this.setModulesToListen(moduleInstances);
      await this.initializePassedModulesReading();
    }
  }

  private createInstancesAndValidate(
    parsedModules: ModuleInternalDto[],
  ): ModuleInternal[] {
    return plainToInstance(ModuleInternal, parsedModules);
  }

  private setModulesToListen(moduleInstances: ModuleInternal[]): void {
    this.modulesToListen = moduleInstances;
  }

  private async initializeRabbitQueues() {
    for (const channelName of Object.values(this.rabbitChannelNames)) {
      await this.rabbitQueueDataSource.startNewQueueOrGetExisting(channelName);
    }
  }
}

export default RadioCommunicationService;
