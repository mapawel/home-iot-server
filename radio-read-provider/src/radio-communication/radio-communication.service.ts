import RadioService from '../radio-board/radio.service';
import Message from './entities/message.entity';
import ReadingBuilder from './radio-utils/reading-builder.util';
import ModuleInternalDto from './dto/module-internal.dto';
import RabbitQueueDataSource from '../data-sources/rbbit-queue.data-source';
import { plainToInstance } from 'class-transformer';
import ModuleInternal from './entities/module-internal.entity';
import { validate, ValidationError } from 'class-validator';
import RadioException from '../exceptions/radio.exception';
import { ExceptionLevel } from '../exceptions/dict/exception-level.enum';
import { RadioExceptionCode } from '../exceptions/dict/exception-codes.enum';

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
      throw new Error('internal! ! ! ');

      await this.initializeRabbitQueues();

      await this.rabbitQueueDataSource.startMsgListener(
        this.rabbitChannelNames.allListenedModules,
        async (messageWithModules: string) =>
          await this.parseValidateSetModulesToListen(messageWithModules),
      );
    } catch (err) {
      throw new RadioException(
        RadioExceptionCode.MESSAGE_READ_ERROR,
        ExceptionLevel.ERROR,
        { cause: err },
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
    try {
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
          await this.createInstancesAndValidate(parsedModules);
        this.setModulesToListen(moduleInstances);
        await this.initializePassedModulesReading();
      }
    } catch (err) {
      throw new Error(
        'problem with parsing a message with all modules to listen from Rabbit.',
        { cause: err },
      );
      // todo global error handling + app specific errors with codes
    }
  }

  private async createInstancesAndValidate(
    parsedModules: ModuleInternalDto[],
  ): Promise<ModuleInternal[]> {
    try {
      const errorsBulkArr = [];
      console.log();
      const moduleInternalInstances: ModuleInternal[] = plainToInstance(
        ModuleInternal,
        parsedModules,
      );
      for (const instance of moduleInternalInstances) {
        const errors: ValidationError[] = await validate(instance);
        if (errors.length) errorsBulkArr.push(errors);
      }
      if (errorsBulkArr.length)
        throw new Error('validation errors', { cause: errorsBulkArr });
      return moduleInternalInstances;
    } catch (err) {
      throw new Error('Problem while creating an instance and validating...', {
        cause: err,
      });
    }
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
