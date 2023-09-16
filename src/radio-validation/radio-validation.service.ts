import * as crypto from 'crypto';
import FastKeysService from '../fast-keys/fast-keys.service';
import Message from '../radio/entities/message.entity';
import Module from '../modules/entity/module';
import ModulesService from '../modules/services/modules.service';
import readingBuilderUtil from '../radio/radio-utils/reading-builder.util';

class RadioValidateAndDecryptService {
  private readonly iv: string = '0011223344556677';
  private readonly fastKeysService: FastKeysService =
    FastKeysService.getInstance();
  private readonly moduleService: ModulesService = new ModulesService();

  constructor() {}

  public async validateAndDecode(
    message: Message,
    callback: (encodedMessage: string) => void,
  ): Promise<void> {
    const { fastId, moduleId, encryptedData }: Message = message;
    this.validateFastKey(fastId, moduleId);
    // consumeKey!
    const module: Module = await this.validateIdAndGetDBModule(moduleId);
    const decrypdedData: string = await this.decryptData(
      encryptedData,
      module.secretKey,
    );
    //check Date used?!
    callback(decrypdedData);
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
