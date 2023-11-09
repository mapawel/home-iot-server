import * as crypto from 'crypto';
import Module from '../../radio-modules/entity/module';
import ModulesService from '../../radio-modules/services/modules.service';
import ModuleReadings from '../types/module-readings.type';
import ReadingType from '../../reading-types/entity/reading-type';
import ReadingFieldType from '../../reading-types/types/reading-field.type';
import ReadingsEnrichedData from '../types/readings-enriched-data.type';
import MessageDto from '../dto/message.dto';
import ConfigBuilder from '../../config-builder/Config-builder';
import { configType } from '../../config-builder/config.type';
import ValidationException from '../../exceptions/validation.exception';
import { ValidationExceptionCode } from '../../exceptions/dict/exception-codes.enum';
import AppLogger from '../../loggers/logger-service/logger.service';
import { ErrorLog } from '../../loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from '../../loggers/log-level/logger-level.enum';
import { ReadModuleDataHandlerInterface } from './read-module-data-handler.interface';

class MessageValidateAndReadService {
  private readonly config: configType = ConfigBuilder.getInstance().config;
  private readonly moduleService: ModulesService = new ModulesService();
  private readonly appLogger: AppLogger = AppLogger.getInstance();

  constructor(
    private readonly messageValidateReadServiceHandler: ReadModuleDataHandlerInterface,
  ) {} //todo Singleton?

  public async decryptValidatedProceedData(message: MessageDto): Promise<void> {
    try {
      const { moduleId, encryptedData, hash }: MessageDto = message;
      const isValid: boolean = this.validateSignature(encryptedData, hash);
      if (!isValid) return;
      const module: Module | null =
        await this.validateIdAndGetDbModule(moduleId);
      if (!module) return;

      const decryptedData: string = await this.decryptData(
        encryptedData,
        module.secretKey,
        module.iv,
      );

      const timeNumberFromMessage: number =
        this.getRoundTimeNumberFromDecryptedData(decryptedData);
      await this.validateAndUpdateReadDate(timeNumberFromMessage, module);

      const parsedReading: ModuleReadings =
        this.getParsedReadingsFromDecrypted(decryptedData);
      console.log('AFTER DECRYPT, parsedReading', parsedReading);

      const data: ReadingsEnrichedData[] = this.translateModuleReadings(
        parsedReading,
        module.readingTypes,
      );

      this.messageValidateReadServiceHandler.proceedReadModuleDataDto({
        moduleDbId: module.id,
        lastReadDate: new Date(timeNumberFromMessage),
        data,
      });
    } catch (err) {
      const error = new ValidationException(
        ValidationExceptionCode.VALIDATION_MODULE_READINGS_GENERAL_ERROR,
        { cause: err },
        message.moduleId,
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      // not thrown, Sentry monitoring
    }
  }

  private async decryptData(
    encryptedData: string,
    secretKey: string,
    iv: string,
  ): Promise<string> {
    try {
      const decipher: crypto.Decipher = crypto.createDecipheriv(
        'aes-128-cbc',
        secretKey,
        iv,
      );

      let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err) {
      const error = new ValidationException(
        ValidationExceptionCode.VALIDATION_MODULE_DECRIPTION_ERROR,
        { cause: err },
      );
      this.appLogger.log(
        new ErrorLog(error, LoggerLevelEnum.ERROR, { encryptedData }),
      );
      throw error;
    }
  }

  private getParsedReadingsFromDecrypted(decryptedData: string) {
    try {
      const mainData: string = decryptedData.split('|')[0];
      if (!mainData) throw Error('String JSON not provided to parse!');
      return JSON.parse(mainData) as ModuleReadings;
    } catch (err) {
      const error = new ValidationException(
        ValidationExceptionCode.VALIDATION_MODULE_READINGS_PARSING_ERROR,
        { cause: err },
      );
      this.appLogger.log(
        new ErrorLog(error, LoggerLevelEnum.ERROR, { decryptedData }),
      );
      throw error;
    }
  }

  private getRoundTimeNumberFromDecryptedData(decryptedData: string): number {
    const timeStampString: string = decryptedData.split('|')?.[1];
    if (!timeStampString) {
      const error = new ValidationException(
        ValidationExceptionCode.VALIDATION_MODULE_TIMESTAMP_ERROR,
      );
      this.appLogger.log(
        new ErrorLog(error, LoggerLevelEnum.ERROR, { decryptedData }),
      );
      throw error;
    }
    return Math.round(new Date(timeStampString).getTime() / 1000) * 1000;
  }

  private async validateAndUpdateReadDate(
    timeNumberFromMessage: number,
    module: Module,
  ): Promise<void> {
    try {
      const { lastReadDate }: Module = module;
      const lastReadDateNumber = lastReadDate?.getTime();

      //todo to uncomment after local tests

      // if (timeNumberFromMessage <= lastReadDateNumber) {
      //   const err = new ValidationException(
      //     ValidationExceptionCode.UNKNOWN_VALIDATION_ERROR,
      //     Level.ERROR,
      //   );
      //   // log err
      //   throw err;
      // }

      await this.moduleService.updateModule(module, {
        lastReadDate: new Date(timeNumberFromMessage),
      });
    } catch (err) {
      const error = new ValidationException(
        ValidationExceptionCode.UNKNOWN_VALIDATION_ERROR,
        { cause: err },
        module.moduleId,
      );
      this.appLogger.log(
        new ErrorLog(error, LoggerLevelEnum.ERROR, { timeNumberFromMessage }),
      );
      throw error;
    }
  }

  private validateSignature(
    encryptedData: string,
    hashToVerify: string,
  ): boolean {
    const hmac = crypto.createHmac('sha256', this.config.appHashKey);
    const hashToCompare: string = hmac.update(encryptedData).digest('hex');
    if (hashToCompare === hashToVerify) return true;

    const error = new ValidationException(
      ValidationExceptionCode.VALIDATION_HASH_ERROR,
    );
    this.appLogger.log(
      new ErrorLog(error, LoggerLevelEnum.ERROR, { encryptedData }),
    );

    return false;
  }

  private async validateIdAndGetDbModule(
    moduleId: string,
  ): Promise<Module | null> {
    const module: Module | null =
      await this.moduleService.getModuleByModuleId(moduleId);
    if (!module) {
      const error = new ValidationException(
        ValidationExceptionCode.VALIDATION_MODULE_ID_ERROR,
        { cause: {} },
        moduleId,
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
    return module;
  }

  private translateModuleReadings(
    parsedReading: ModuleReadings,
    moduleReadingTypes: ReadingType[],
  ): ReadingsEnrichedData[] {
    if (Object.keys(parsedReading).length !== moduleReadingTypes.length) {
      const error = new ValidationException(
        ValidationExceptionCode.VALIDATION_MODULE_READINGS_TRANSLATION_ERROR,
        { cause: {} },
      );
      this.appLogger.log(
        new ErrorLog(error, LoggerLevelEnum.ERROR, { parsedReading }),
      );
      throw error;
    }

    return Object.entries(parsedReading).map(
      (data: [string, string | number | boolean], currentIndex: number) => ({
        reading: this.getFormattedData(
          data[1],
          moduleReadingTypes[currentIndex].type,
        ),
        type: moduleReadingTypes[currentIndex].type,
        readingTypeDbId: moduleReadingTypes[currentIndex].id,
      }),
    );
  }

  private getFormattedData(data: unknown, type: ReadingFieldType) {
    switch (type) {
      case ReadingFieldType.BOOLEAN:
        return Boolean(data);
      case ReadingFieldType.NUMBER:
        return Number(data);
      case ReadingFieldType.STRING:
        return String(data);
      default:
        throw new ValidationException(
          ValidationExceptionCode.VALIDATION_MODULE_READINGS_TRANSLATION_ERROR,
        );
    }
  }
}

export default MessageValidateAndReadService;
