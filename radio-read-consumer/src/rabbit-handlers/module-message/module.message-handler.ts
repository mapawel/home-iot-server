import { ConsumeMessage } from 'amqplib';
import { MessageHandler } from '../../data-sources/rabbit/message-handler.interface';
import ModuleReadingsPersistService from '../../module-readings/service/module-readings-persist.service';
import ModuleReadingBase from '../../module-readings/entity/module-reading-base';
import ReadingTypeField from '../../reading-types/types/reading-field.type';
import mySQLDataSource from '../../data-sources/sql/mySQL.data-source';
import ModuleReadingNumber from '../../module-readings/entity/module-reading-number';
import ModuleReadingBool from '../../module-readings/entity/module-reading-bool';
import MessageValidateReadService from '../../module-readings/service/message-validate-read.service';
import ReadModuleDataDto from '../../module-readings/dto/read-module-data.dto';

export class ModuleMessageHandler implements MessageHandler {
  public async proceedTaskOnMessage(message: ConsumeMessage): Promise<void> {
    try {
      const stringMessage = message.content.toString();
      const messageObj = JSON.parse(stringMessage);
      console.log('>>>>>>>>>>>> handled: ', messageObj);

      // const moduleReadingsPersistService =
      //   new ModuleReadingsPersistService<ModuleReadingBase>([
      //     {
      //       readingFieldType: ReadingTypeField.NUMBER,
      //       repository: mySQLDataSource.getRepository(ModuleReadingNumber),
      //     },
      //     {
      //       readingFieldType: ReadingTypeField.BOOLEAN,
      //       repository: mySQLDataSource.getRepository(ModuleReadingBool),
      //     },
      //   ]);
      //
      // const messageValidateReadService = new MessageValidateReadService();
      // messageValidateReadService.decryptAndReturnValidatedObject(
      //   message.content.toString(),
      //   (data: ReadModuleDataDto) => {
      //     console.log('GO!', data);
      //     moduleReadingsPersistService.saveReadings(data);
      //   },
      // );
    } catch (err) {
      throw err;
    }
  }
}

// {
//   moduleId: '039e60c874a',
//       encryptedData:
//   '9HCO6rzyO7iJsemL8cUijXlJhhbyGak/0yI6H4MRuXJb8kero1iGo2o93URcopxPTtOyvvE8F4P80I+qPmGtYQ==',
//       hash: 'cdc49bbbd1b81891a5e7ddd7abb61e1162bbcea4d5c8dc0feed6950565d2025d',
// }

// '{"moduleId":"039e60c874a","encryptedData":"9HCO6rzyO7iJsemL8cUijXlJhhbyGak/0yI6H4MRuXJb8kero1iGo2o93URcopxPTtOyvvE8F4P80I+qPmGtYQ==","hash":"cdc49bbbd1b81891a5e7ddd7abb61e1162bbcea4d5c8dc0feed6950565d2025d"}'
