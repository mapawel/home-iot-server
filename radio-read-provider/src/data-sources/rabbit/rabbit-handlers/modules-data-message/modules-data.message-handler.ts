import { ConsumeMessage } from 'amqplib';
import { MessageHandler } from '../../message-handler.interface';
import ApplicationException from '../../../../exceptions/application.exception';
import { ApplicationExceptionCode } from '../../../../exceptions/dict/exception-codes.enum';
import { ErrorLog } from '../../../../loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from '../../../../loggers/log-level/logger-level.enum';
import AppLogger from '../../../../loggers/logger-service/logger.service';
import ModuleInternalDto from '../../../../radio-communication/dto/module-internal.dto';
import { InfoLog } from '../../../../loggers/info-log/info-log.instance';
import ModuleInternal from '../../../../radio-communication/entities/module-internal.entity';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import RadioService from '../../../../radio-board/radio.service';
import { RadioMessageMessageHandler } from '../../../../radio-communication/radio-handlers/radio-message/radio-message.message-handler';

export class ModulesDataMessageHandler implements MessageHandler {
  private readonly appLogger: AppLogger = AppLogger.getInstance();
  private readonly radio: RadioService = RadioService.getInstance(
    new RadioMessageMessageHandler(),
  );
  private modulesToListen: Map<string, ModuleInternal> = new Map();

  public async proceedTaskOnMessage(message: ConsumeMessage): Promise<void> {
    try {
      const messageWithModules: string = message.content.toString();
      const moduleInstances =
        await this.parseValidateSetModulesToListen(messageWithModules);
      if (!moduleInstances) return;

      this.setModulesToListen(moduleInstances);
      await this.initializePassedModulesReading();
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
  }

  private async parseValidateSetModulesToListen(
    messageWithModules: string,
  ): Promise<ModuleInternal[] | void> {
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

        return await this.createInstancesAndValidate(parsedModules);
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

  private async initializePassedModulesReading(): Promise<void> {
    try {
      this.modulesToListen.forEach((module: ModuleInternal) => {
        const { pipeAddress, name } = module;
        this.radio.setPipeToListen(pipeAddress);

        this.appLogger.log(
          new InfoLog(
            `Module ${name} on pipe np ${pipeAddress} passed to listen.`,
            { details: module },
          ),
        );
      });

      this.radio.startListeningAndProceed();
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
}
