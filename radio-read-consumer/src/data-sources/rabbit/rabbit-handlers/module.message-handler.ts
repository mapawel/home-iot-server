import { ConsumeMessage } from 'amqplib';
import { MessageHandler } from '../message-handler.interface';
import MessageValidateReadService from '../../../module-readings/service/message-validate-read.service';
import { ReadModuleDataHandler } from '../../../module-readings/read-module-data-handler/read-module-data.handler';
import MessageDto from '../../../module-readings/dto/message.dto';

export class ModuleMessageHandler implements MessageHandler {
  public async proceedTaskOnMessage(
    rabbitMessage: ConsumeMessage,
  ): Promise<void> {
    try {
      const stringMessage: string = rabbitMessage.content.toString();
      const message: MessageDto = JSON.parse(stringMessage);

      const messageValidateReadService = new MessageValidateReadService(
        new ReadModuleDataHandler(),
      );
      await messageValidateReadService.decryptValidatedProceedData(message);
    } catch (err) {
      throw err;
    }
  }
}
