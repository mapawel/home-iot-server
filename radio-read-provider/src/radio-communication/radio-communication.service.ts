import RadioService from '../radio-board/radio.service';
import Message from './entities/message.entity';
import ReadingBuilder from './radio-utils/reading-builder.util';
import ModuleDto from './entities/module.dto';
import RabbitQueueDataSource from '../data-sources/rbbit-queue.data-source';

class RadioCommunicationService {
  private readonly radio: RadioService = RadioService.getInstance();
  private readonly readingBuilder: ReadingBuilder = new ReadingBuilder();
  private readonly rabbitChannelNames = {
    allListenedModules: 'allListenedModules',
    messages: 'messages',
  };
  private readonly rabbitQueueDataSource: RabbitQueueDataSource =
    RabbitQueueDataSource.getInstance();
  private modulesToListen: ModuleDto[] = [];

  constructor() {}

  public async startRadioCommunicationBasedOnRabbitData() {
    try {
      await this.initializeRabbitQueues();

      await this.rabbitQueueDataSource.startMsgListener(
        this.rabbitChannelNames.allListenedModules,
        (x: string) => {
          console.log('>>>>>>>>>>>>>>>>>>>', x);
        }, // add modules received via rabbit to modulesToListen
      );

      await this.initializePassedModulesReading();
    } catch (err) {
      throw new Error(
        `it will be a domain error from radioCommService: ${err}`,
      );
    }
  }

  public initializePassedModulesReading() {
    for (const module of this.modulesToListen) {
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

  private async initializeRabbitQueues() {
    for (const channelName of Object.values(this.rabbitChannelNames)) {
      await this.rabbitQueueDataSource.startNewQueueOrGetExisting(channelName);
    }
  }
}

export default RadioCommunicationService;
