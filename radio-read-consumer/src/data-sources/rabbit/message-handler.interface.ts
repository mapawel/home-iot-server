import {ConsumeMessage} from 'amqplib';

export interface MessageHandler {
	proceedTaskOnMessage(message: ConsumeMessage): Promise<void>;
}


