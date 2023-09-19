import * as crypto from 'crypto';
import FastKeysService from '../fast-keys/fast-keys.service';
import Message from '../radio/entities/message.entity';
import Module from '../modules/entity/module';
import ModulesService from '../modules/services/modules.service';
import MessageDataType from './parsed-message-data.type';
import ReadingType from '../reading-types/entity/reading-type';
import ReadingFieldType from '../reading-types/types/reading-field.type';
import ModuleReadingsService from '../module-readings/service/module-readings.service';

class RadioValidateAndDecryptService {
  private readonly iv: string = '0011223344556677'; // todo to .env
  private readonly fastKeysService: FastKeysService =
    FastKeysService.getInstance();
  private readonly moduleService: ModulesService = new ModulesService();
  private readonly moduleReadingsService: ModuleReadingsService =
    new ModuleReadingsService();

  constructor() {}

  public async validateDecryptAndReturnObject(
    message: Message,
    callback: (encodedMessage: MessageDataType) => void,
  ): Promise<void> {
    const { fastId, moduleId, encryptedData }: Message = message;
    this.validateFastKey(fastId, moduleId);
    this.fastKeysService.consumeKey(fastId);

    const module: Module = await this.validateIdAndGetDBModule(moduleId);
    const decryptedData: string = await this.decryptData(
      encryptedData,
      module.secretKey,
    );

    const timeNumberFromMessage: number =
      this.getRoundTimeNumberFromDecryptedData(decryptedData);
    await this.validateAndUpdateReadDate(timeNumberFromMessage, module);

    const parsedData: MessageDataType =
      this.getParsedDataFromDecrypted(decryptedData);

    const dataObject: MessageDataType = this.translateModuleDataToObject(
      parsedData,
      module.readingTypes,
    );
    // await this.moduleReadingsService.addReading(dataObject, module);
    callback(dataObject);
  }

  private getDataWithType(data: unknown, type: ReadingFieldType) {
    switch (type) {
      case ReadingFieldType.BOOLEAN:
        return Boolean(data);
      case ReadingFieldType.NUMBER:
        return Number(data);
      case ReadingFieldType.STRING:
        return String(data);
      default:
        throw Error(
          'A problem with data type declared in readingTypes linked to module witch message os from',
        );
    }
  }

  private translateModuleDataToObject(
    parsedData: MessageDataType,
    moduleReadingTypes: ReadingType[],
  ): MessageDataType {
    if (Object.keys(parsedData).length !== moduleReadingTypes.length)
      throw new Error(
        'could not match parsed object keys from message with reading types declared for module sending this message',
      );
    return Object.entries(parsedData).reduce(
      (
        acc: object,
        x: [string, string | number | boolean],
        currentIndex: number,
      ) => ({
        ...acc,
        [moduleReadingTypes[currentIndex].name]: this.getDataWithType(
          x[1],
          moduleReadingTypes[currentIndex].type,
        ),
      }),
      {},
    );
  }

  private decryptData(
    encryptedData: string,
    secretKey: string,
  ): Promise<string> {
    return new Promise((resolve, reject): void => {
      const decipher: crypto.Decipher = crypto.createDecipheriv(
        'aes-128-cbc',
        secretKey,
        this.iv,
      );
      let decryptedData = '';
      decipher.on('readable', () => {
        let chunk;
        while (null !== (chunk = decipher.read())) {
          decryptedData += chunk.toString();
        }
      });
      decipher.on('end', () => {
        resolve(decryptedData);
      });
      decipher.on('error', (err) => {
        reject(err);
      });

      decipher.write(encryptedData, 'base64');
      decipher.end();
    });
  }

  private getParsedDataFromDecrypted(decryptedData: string) {
    try {
      const mainData: string = decryptedData.split('|')[0];
      return JSON.parse(mainData) as MessageDataType;
    } catch (err) {
      throw new Error('Could not parse data from encrypted message!');
    }
  }

  private getRoundTimeNumberFromDecryptedData(decryptedData: string): number {
    const timeStampString: string = decryptedData.split('|')?.[1];
    if (!timeStampString)
      throw Error('no timestamp in encrypted data from message');
    return Math.round(new Date(timeStampString).getTime() / 1000) * 1000;
  }

  private async validateAndUpdateReadDate(
    timeNumberFromMessage: number,
    module: Module,
  ): Promise<void> {
    const { moduleId, lastReadDate }: Module = module;
    const lastReadDateNumber = lastReadDate?.getTime();

    if (timeNumberFromMessage <= lastReadDateNumber)
      throw new Error(
        `Timestamp from message is equal or smaller than last read date. Module id: ${moduleId}.`,
      );
    await this.moduleService.updateModule(module, {
      lastReadDate: new Date(timeNumberFromMessage),
    });
  }

  private validateFastKey(key: string, moduleId: string): void {
    const isFound: boolean = this.fastKeysService.checkIfExisting(key);
    if (!isFound)
      throw new Error(
        `Fast key is not found sent by module id: ${moduleId}, it will be a domain error`,
      );
  }

  private async validateIdAndGetDBModule(moduleId: string): Promise<Module> {
    const module: Module | null =
      await this.moduleService.getModuleByModuleId(moduleId);
    if (!module)
      throw new Error(
        'Module specified in message with valid fast-id not found in DB and it will be a domain error!',
      );
    return module;
  }
}

export default RadioValidateAndDecryptService;
