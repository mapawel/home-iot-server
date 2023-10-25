import * as crypto from 'crypto';
import Module from '../../radio-modules/entity/module';
import ModulesService from '../../radio-modules/services/modules.service';
import MessageDataType from '../types/message-data.type';
import ReadingType from '../../reading-types/entity/reading-type';
import ReadingFieldType from '../../reading-types/types/reading-field.type';
import ModuleDataDtoMapper from '../dto/module-data-dto.mapper';
import ModuleDataDto from '../dto/module-data.dto';
import DataType from '../types/data.type';
import MessageDto from '../dto/message.dto';

class MessageValidateAndReadService {
  private readonly iv: string = '0011223344556677'; // todo to module DB data, unique for each module
  private readonly moduleService: ModulesService = new ModulesService();

  constructor() {} //todo Singleton?

  public async decryptAndReturnValidatedObject(
    message: MessageDto,
    callback: (moduleDataDto: ModuleDataDto) => void,
  ): Promise<void> {
    const { hash, moduleId, encryptedData }: MessageDto = message;
    this.validateFastKey(hash, encryptedData);

    const module: Module = await this.validateIdAndGetDbModule(moduleId);
    const decryptedData: string = await this.decryptData(
      encryptedData,
      module.secretKey,
    );

    const timeNumberFromMessage: number =
      this.getRoundTimeNumberFromDecryptedData(decryptedData);
    await this.validateAndUpdateReadDate(timeNumberFromMessage, module);

    const parsedData: MessageDataType =
      this.getParsedDataFromDecrypted(decryptedData);

    const data: DataType[] = this.translateModuleData(
      parsedData,
      module.readingTypes,
    );

    callback(new ModuleDataDtoMapper(data, module).mapModuleData());
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
        throw Error(
          'A problem with data type declared in readingTypes linked to module witch message is from',
        );
    }
  }

  private translateModuleData(
    parsedData: MessageDataType,
    moduleReadingTypes: ReadingType[],
  ): DataType[] {
    if (Object.keys(parsedData).length !== moduleReadingTypes.length)
      throw new Error(
        'could not match parsed object keys from message with reading types declared for module sending this message',
      );

    return Object.entries(parsedData).map(
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

    // if (timeNumberFromMessage <= lastReadDateNumber)
    //   throw new Error(
    //     `Timestamp from message is equal or smaller than last read date. Module id: ${moduleId}.`,
    //   );
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

  private async validateIdAndGetDbModule(moduleId: string): Promise<Module> {
    const module: Module | null =
      await this.moduleService.getModuleByModuleId(moduleId);
    if (!module)
      throw new Error(
        'Module specified in message with valid fast-id not found in DB and it will be a domain error!',
      );
    return module;
  }
}

export default MessageValidateAndReadService;
