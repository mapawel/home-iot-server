import * as crypto from 'crypto';
import Module from '../../radio-modules/entity/module';
import ModulesService from '../../radio-modules/services/modules.service';
import ModuleReadings from '../types/module-readings.type';
import ReadingType from '../../reading-types/entity/reading-type';
import ReadingFieldType from '../../reading-types/types/reading-field.type';
import ReadModuleDataDto from '../dto/read-module-data.dto';
import ReadingsEnrichedData from '../types/readings-enriched-data.type';
import MessageDto from '../dto/message.dto';
import ConfigBuilder from '../../config-builder/Config-builder';
import { configType } from '../../config-builder/config.type';
import ValidationException from '../../exceptions/validation.exception';
import { ValidationExceptionCode } from '../../exceptions/dict/exception-codes.enum';
import { Level } from '../../logger/dict/level.enum';
import LoggerService from '../../logger/logger.service';
import Log from '../../logger/log.entity';

const { config }: { config: configType } = ConfigBuilder.getInstance();

class MessageValidateAndReadService {
  // todo add module Id to exceptions
  private readonly moduleService: ModulesService = new ModulesService();

  constructor() {} //todo Singleton?

  public async decryptAndReturnValidatedObject(
    message: MessageDto,
    callback: (readModuleDataDto: ReadModuleDataDto) => void,
  ): Promise<void> {
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

      callback({
        moduleDbId: module.id,
        lastReadDate: new Date(timeNumberFromMessage),
        data,
      });
    } catch (err) {
      throw err;
      // err
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
        Level.ERROR,
        { cause: err },
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
        Level.ERROR,
      );
      // log err
      LoggerService.getInstance().logError(new Log(error));
      throw error;
    }
  }

  private getRoundTimeNumberFromDecryptedData(decryptedData: string): number {
    const timeStampString: string = decryptedData.split('|')?.[1];
    if (!timeStampString) {
      const err = new ValidationException(
        ValidationExceptionCode.VALIDATION_MODULE_TIMESTAMP_ERROR,
        Level.ERROR,
      );
      // log err
      throw err;
    }
    return Math.round(new Date(timeStampString).getTime() / 1000) * 1000;
  }

  private async validateAndUpdateReadDate(
    timeNumberFromMessage: number,
    module: Module,
  ): Promise<void> {
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
  }

  private validateSignature(
    encryptedData: string,
    hashToVerify: string,
  ): boolean {
    const hmac = crypto.createHmac('sha256', config.appHashKey);
    const hashToCompare: string = hmac.update(encryptedData).digest('hex');
    if (hashToCompare === hashToVerify) return true;
    const err = new ValidationException(
      ValidationExceptionCode.VALIDATION_HASH_ERROR,
      Level.WARNING,
    );
    //log err
    return false;
  }

  private async validateIdAndGetDbModule(
    moduleId: string,
  ): Promise<Module | null> {
    const module: Module | null =
      await this.moduleService.getModuleByModuleId(moduleId);
    if (!module) {
      const err = new ValidationException(
        ValidationExceptionCode.VALIDATION_MODULE_ID_ERROR,
        Level.WARNING,
      );
      // log err
      return null;
    }
    return module;
  }

  private translateModuleReadings(
    parsedReading: ModuleReadings,
    moduleReadingTypes: ReadingType[],
  ): ReadingsEnrichedData[] {
    if (Object.keys(parsedReading).length !== moduleReadingTypes.length) {
      const err = new ValidationException(
        ValidationExceptionCode.VALIDATION_MODULE_READINGS_TRANSLATION_ERROR,
        Level.ERROR,
      );
      // log err
      throw err;
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
          Level.ERROR,
          {
            cause: new Error(
              'A problem with data type declared in readingTypes linked to module witch message is from',
            ),
          },
        );
    }
  }
}

export default MessageValidateAndReadService;
