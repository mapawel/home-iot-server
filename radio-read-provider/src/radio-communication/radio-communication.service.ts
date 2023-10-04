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
import { LogLevel } from '../logger/dict/log-level.enum';
import ExceptionManagerService from '../exceptions/exception-manager.service';
import LoggerService from '../logger/logger.service';
import Log from '../logger/log.entity';

class RadioCommunicationService {
  private readonly radio: RadioService = RadioService.getInstance();
  private readonly readingBuilder: ReadingBuilder = new ReadingBuilder();
  private readonly rabbitChannelNames = {
    allListenedModules: 'allListenedModules',
    // messages: 'messages',
  };
  private readonly rabbitQueueDataSource: RabbitQueueDataSource =
    RabbitQueueDataSource.getInstance();
  private modulesToListen: Map<string, ModuleInternal> = new Map();

  private readonly exceptionManager: ExceptionManagerService =
    ExceptionManagerService.getInstance();
  private readonly loggerService: LoggerService = LoggerService.getInstance();

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
      const error = new RadioException(
        RadioExceptionCode.MESSAGE_READ_ERROR,
        ExceptionLevel.ERROR,
        { cause: err },
      );
      await this.exceptionManager.logException(LogLevel.EXCEPTION, error);
      throw error;
    }
  }

  private async initializePassedModulesReading() {
    try {
      console.log(
        '------- this.modulesToListen -------: ',
        this.modulesToListen,
      );
      this.modulesToListen.forEach((module) => {
        console.log('to init ------->', module);
        const { pipeAddress } = module;
        const log: Log = new Log({
          level: LogLevel.INFO,
          message: `! ! ! module ${module.name} started to listen!`,
          data: { module },
        });
        this.loggerService.saveLogToFile(log);
        console.log(`! ! ! module ${module.name} started to listen!`);

        this.radio.startReadingAndProceed(
          this.radio.getOrAddNewReadPipe(pipeAddress),
          async (messageFragment: string) =>
            await this.readingBuilder.getFinalMergedMessage(
              messageFragment,
              (message: Message) => console.log('-> ', message),
            ),
        );

        console.log('pipes: ', this.radio.pipes);
      });
    } catch (err) {
      const error = new RadioException(
        RadioExceptionCode.CONNECTION_ERROR,
        ExceptionLevel.FATAL,
        { cause: err },
      );
      await this.exceptionManager.logException(LogLevel.EXCEPTION, error);
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

      const log: Log = new Log({
        level: LogLevel.INFO,
        message: `Received modules via Rabbit from DB from API: ${messageWithModules}`,
        data: {},
      });
      await this.loggerService.saveLogToFile(log);
      console.log(
        `Received modules via Rabbit from DB from API: ${messageWithModules}`,
      );

      if (parsedModules) {
        const moduleInstances: ModuleInternal[] =
          await this.createInstancesAndValidate(parsedModules);
        this.setModulesToListen(moduleInstances);
        await this.initializePassedModulesReading();
      }
    } catch (err) {
      const error = new RadioException(
        RadioExceptionCode.CONNECTION_ERROR,
        ExceptionLevel.FATAL,
        { cause: err },
      );
      await this.exceptionManager.logException(LogLevel.EXCEPTION, error);
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
      const error = new RadioException(
        RadioExceptionCode.MESSAGE_PARSE_ERROR,
        ExceptionLevel.FATAL,
        { cause: err },
      );
      await this.exceptionManager.logException(LogLevel.EXCEPTION, error);
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
