import * as crypto from 'crypto';
import FastKeysService from '../fast-keys/fast-keys.service';
import Message from '../radio/entities/message.entity';
import Module from '../modules/entity/module';
import ModulesService from '../modules/services/modules.service';

class RadioValidateAndDecryptService {
  private readonly iv: string = '0011223344556677'; // todo to .env
  private readonly fastKeysService: FastKeysService =
    FastKeysService.getInstance();
  private readonly moduleService: ModulesService = new ModulesService();

  constructor() {}

  public async validateAndDecrypt(
    message: Message,
    callback: (encodedMessage: unknown) => void,
  ): Promise<void> {
    const { fastId, moduleId, encryptedData }: Message = message;
    this.validateFastKey(fastId, moduleId);
    this.fastKeysService.consumeKey(fastId);

    const module: Module = await this.validateIdAndGetDBModule(moduleId);
    const decryptedData: string = await this.decryptData(
      encryptedData,
      module.secretKey,
    );

    const timestampDate: Date =
      this.getTimestampFromDecryptedData(encryptedData);
    await this.validateAndUpdateReadDate(timestampDate, module);

    const dataObject = this.getDataObjectFromDecryptedData(decryptedData);
    callback(dataObject);
  }

  public decryptData(
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

  private getDataObjectFromDecryptedData(decryptedData: string) {
    try {
      const mainData: string = decryptedData.split('|')[0];
      const dataObject: unknown = JSON.parse(mainData);
      return dataObject;
    } catch (err) {
      throw new Error('Could not parse data from encrypted message!');
    }
  }

  private getTimestampFromDecryptedData(decryptedData: string): Date {
    const timestapmString: string = decryptedData.split('|')?.[1];
    if (!timestapmString)
      throw Error('no timestamp in encrypted data from message');
    return new Date(timestapmString);
  }

  private async validateAndUpdateReadDate(
    timestampDate: Date,
    module: Module,
  ): Promise<void> {
    const { moduleId, lastReadDate }: Module = module;
    if (timestampDate !== lastReadDate)
      throw new Error(
        `Timestamp from message is not equal last read date. Module id: ${moduleId}.`,
      );
    await this.moduleService.updateModule(module, {
      lastReadDate: timestampDate,
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
