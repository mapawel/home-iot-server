import Message from '../entities/message.entity';

export interface ReadingBuilderMessageHandler {
  proceedMessage(message: Message): Promise<void>;
}
