import RadioService from '../radio-board/radio.service';
import Message from './entities/message.entity';
import ReadingBuilder from './radio-utils/reading-builder.util';
import ModuleInternalDto from './dto/module-internal.dto';
import RabbitQueueDataSource from '../data-sources/rbbit-queue.data-source';
import { plainToInstance } from 'class-transformer';
import ModuleInternal from './entities/module-internal.entity';
import { validate, ValidationError } from 'class-validator';
import { Level } from '../logger/dict/level.enum';
import LoggerService from '../logger/logger.service';
import Log from '../logger/log.entity';
import ApplicationException from '../exceptions/application.exception';
import { rabbitChannelNames } from '../data-sources/rabbit-channel-names.enum';
import RadioException from '../exceptions/radio.exception';
import { RadioExceptionCode } from '../exceptions/dict/exception-codes.enum';

class RadioCommunicationService {
  private readonly radio: RadioService = RadioService.getInstance();
  private readonly readingBuilder: ReadingBuilder = new ReadingBuilder();
  private readonly rabbitQueueDataSource: RabbitQueueDataSource =
    RabbitQueueDataSource.getInstance();
  private readonly rabbitChannelNames = {
    [rabbitChannelNames.ALL_LISTENED_MODULES]:
      rabbitChannelNames.ALL_LISTENED_MODULES,
    // [rabbitChannelNames.MESSAGES]: rabbitChannelNames.MESSAGES,
  };
  private modulesToListen: Map<string, ModuleInternal> = new Map();
  private readonly loggerService: LoggerService = LoggerService.getInstance();

  public async startRadioCommunicationBasedOnRabbitData() {
    try {
      await this.initializeRabbitQueues();

      await this.rabbitQueueDataSource.startMsgListener(
        rabbitChannelNames.ALL_LISTENED_MODULES,
        async (messageWithModules: string): Promise<void> => {
          try {
            await this.parseValidateSetModulesToListen(messageWithModules);
          } catch (err) {
            const error = new ApplicationException(
              'Could not proceed data containing all modules received from Rabbit',
              Level.FATAL,
              {
                cause: err,
              },
            );
            this.loggerService.logError(new Log(error));
            throw error;
          }
        },
      );
    } catch (err) {
      const error = new ApplicationException(
        'Problem with starting radio communication based on Rabbit data.',
        Level.ERROR,
        { cause: err },
      );
      this.loggerService.logError(new Log(error));
      throw error;
    }
  }

  private async initializePassedModulesReading() {
    try {
      this.modulesToListen.forEach((module: ModuleInternal) => {
        const { pipeAddress } = module;

        this.radio.startReadingAndProceed(
          this.radio.getOrAddNewReadPipe(pipeAddress),
          async (messageFragment: string) => {
            try {
              await this.readingBuilder.getFinalMergedMessage(
                messageFragment,
                async (message: Message) => {
                  try {
                    console.log('-> ', message);
                  } catch (err) {
                    const error = new ApplicationException(
                      'Problem in callback passed to getFinalMergedMessage. Message not proceeded!',
                      Level.FATAL,
                      { cause: err },
                    );
                    this.loggerService.logError(new Log(error));
                    throw error;
                  }
                },
              );
            } catch (err) {
              const error = new RadioException(
                RadioExceptionCode.MESSAGE_READ_ERROR,
                Level.FATAL,
                { cause: err },
              );
              this.loggerService.logError(new Log(error));
              throw error;
            }
          },
        );

        this.loggerService.logInfo(
          new Log({
            message: `Module ${module.name} on pipe np ${module.pipeAddress} initialized to start listening.`,
            details: { module },
          }),
        );
      });
    } catch (err) {
      const error = new ApplicationException(
        'Could not initialize all passed modules to listen',
        Level.FATAL,
        { cause: err },
      );
      this.loggerService.logError(new Log(error));
      throw error;
    }
  }

  private async parseValidateSetModulesToListen(
    messageWithModules: string,
  ): Promise<void> {
    try {
      const parsedModules: ModuleInternalDto[] = JSON.parse(
        messageWithModules,
      ) as unknown as ModuleInternalDto[];

      if (parsedModules) {
        this.loggerService.logInfo(
          new Log({
            message: 'Modules via Rabbit from DB from API received.',
            details: { stringModules: messageWithModules },
          }),
        );

        const moduleInstances: ModuleInternal[] =
          await this.createInstancesAndValidate(parsedModules);
        this.setModulesToListen(moduleInstances);
        await this.initializePassedModulesReading();
      }
    } catch (err) {
      const error = new ApplicationException(
        'Could not parse and set modules to listen',
        Level.FATAL,
        { cause: err },
      );
      this.loggerService.logError(new Log(error));
      throw error;
    }
  }

  private async createInstancesAndValidate(
    parsedModules: ModuleInternalDto[],
  ): Promise<ModuleInternal[]> {
    try {
      const errorsBulkArr = [];
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
      const error = new ApplicationException(
        'Could not create modules instances to listen',
        Level.FATAL,
        { cause: err },
      );
      this.loggerService.logError(new Log(error));
      throw error;
    }
  }

  private setModulesToListen(moduleInstances: ModuleInternal[]): void {
    for (const module of moduleInstances)
      this.modulesToListen.set(module.moduleId, module);
  }

  private async initializeRabbitQueues() {
    for (const channelName of Object.values(this.rabbitChannelNames)) {
      await this.rabbitQueueDataSource.startNewQueueOrGetExisting(channelName);
    }
  }
}

export default RadioCommunicationService;
