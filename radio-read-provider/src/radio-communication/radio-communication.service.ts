import RadioService from '../radio-board/radio.service';
import Message from './entities/message.entity';
import ReadingBuilder from './radio-utils/reading-builder.util';
import ModuleInternalDto from './dto/module-internal.dto';
import RabbitQueueDataSource from '../data-sources/rabbit-queue.data-source';
import { plainToInstance } from 'class-transformer';
import ModuleInternal from './entities/module-internal.entity';
import { validate, ValidationError } from 'class-validator';
import ApplicationException from '../exceptions/application.exception';
import { rabbitChannelNames } from '../data-sources/rabbit-channel-names.enum';
import RadioException from '../exceptions/radio.exception';
import {
  ApplicationExceptionCode,
  RadioExceptionCode,
} from '../exceptions/dict/exception-codes.enum';
import AppLogger from '../loggers/logger-service/logger.service';
import { ErrorLog } from '../loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from '../loggers/log-level/logger-level.enum';
import { InfoLog } from '../loggers/info-log/info-log.instance';

class RadioCommunicationService {
  private readonly radio: RadioService = RadioService.getInstance();
  private readonly readingBuilder: ReadingBuilder = new ReadingBuilder();
  private readonly rabbitQueueDataSource: RabbitQueueDataSource =
    RabbitQueueDataSource.getInstance();
  private readonly rabbitChannelNames = {
    [rabbitChannelNames.ALL_LISTENED_MODULES]:
      rabbitChannelNames.ALL_LISTENED_MODULES,
    [rabbitChannelNames.MESSAGES]: rabbitChannelNames.MESSAGES,
  };
  private modulesToListen: Map<string, ModuleInternal> = new Map();
  private readonly appLogger: AppLogger = AppLogger.getInstance();

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
              ApplicationExceptionCode.PROCEEDING_FLOW_ERROR,
              {
                cause: err,
              },
              'Module not known - could not proceed data containing all modules received from Rabbit',
            );
            this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
            throw error;
          }
        },
      );
    } catch (err) {
      const error = new ApplicationException(
        ApplicationExceptionCode.UNKNOWN_ERROR,
        { cause: err },
        'Module not known - Problem with starting radio communication based on Rabbit data.',
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
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
                    //todo to remove clg
                    console.log('-> ', message);
                    await this.rabbitQueueDataSource.sendMessage(
                      rabbitChannelNames.MESSAGES,
                      JSON.stringify(message),
                    );
                  } catch (err) {
                    const error = new ApplicationException(
                      ApplicationExceptionCode.UNKNOWN_ERROR,
                      { cause: err },
                      'Problem in callback passed to getFinalMergedMessage. Message not proceeded!',
                    );
                    this.appLogger.log(
                      new ErrorLog(error, LoggerLevelEnum.ERROR),
                    );
                    throw error;
                  }
                },
              );
            } catch (err) {
              const error = new RadioException(
                RadioExceptionCode.MESSAGE_READ_ERROR,
                { cause: err },
              );
              this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
              // throw error; //DONT THROW TO NOT STOP THE APP !!!
            }
          },
        );

        this.appLogger.log(
          new InfoLog(
            `Module ${module.name} on pipe np ${module.pipeAddress} initialized to start listening.`,
            { details: module },
          ),
        );
      });
    } catch (err) {
      const error = new ApplicationException(
        ApplicationExceptionCode.UNKNOWN_ERROR,
        { cause: err },
        'Could not initialize all passed modules to listen',
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
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
        this.appLogger.log(
          new InfoLog('Modules via Rabbit from DB from API received.', {
            stringModules: messageWithModules,
          }),
        );

        const moduleInstances: ModuleInternal[] =
          await this.createInstancesAndValidate(parsedModules);
        this.setModulesToListen(moduleInstances);
        await this.initializePassedModulesReading();
      }
    } catch (err) {
      const error = new ApplicationException(
        ApplicationExceptionCode.UNKNOWN_ERROR,
        { cause: err },
        'Could not parse and set modules to listen',
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
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
        ApplicationExceptionCode.UNKNOWN_ERROR,
        { cause: err },
        'Could not create modules instances to listen',
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
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
