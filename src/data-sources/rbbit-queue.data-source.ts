import ampqlib, { Connection, Channel } from 'amqplib';
import { ConfigBuilder } from '../config-builder/Config-builder';
import { configType } from '../config-builder/config.type';

const {
  config: {
    rabbitmq: { host },
  },
}: { config: configType } = ConfigBuilder.getInstance();

export class RabbitQueueDataSource {
  private static instance: RabbitQueueDataSource | null = null;
  private connection: Connection;
  private queues: Map<string, Channel> = new Map();

  constructor() {}

  public static getInstance() {
    if (RabbitQueueDataSource.instance) return RabbitQueueDataSource.instance;
    return (RabbitQueueDataSource.instance = new RabbitQueueDataSource());
  }

  public async sendMessage(queueName: string, message: string): Promise<void> {
    const [name, channel]: [string, Channel] =
      await this.startNewQueueOrGetExisting(queueName);

    const sendResponse: boolean = channel.sendToQueue(
      name,
      Buffer.from(message),
    );

    if (!sendResponse) throw new Error(`Message not sent! Message: ${message}`);
  }

  public async startMsgListener(
    queueName: string,
    callback: (msg: string) => void,
  ) {
    const [name, channel]: [string, Channel] =
      await this.startNewQueueOrGetExisting(queueName);

    return channel.consume(name, (msg) => {
      const stringMessage: string | undefined = msg?.content.toString();
      if (msg) channel.ack(msg);
      if (stringMessage) callback(stringMessage);
    });
  }

  public async startNewQueueOrGetExisting(
    queueName: string,
  ): Promise<[string, Channel]> {
    if (!this.connection) this.connection = await ampqlib.connect(host);

    const searchedQueueChannel: Channel | undefined =
      this.queues.get(queueName);
    if (searchedQueueChannel) return [queueName, searchedQueueChannel];

    const newChannel: Channel = await this.connection.createChannel();
    await newChannel.assertQueue(queueName);

    this.queues.set(queueName, newChannel);

    return this.getQueueWithValidation(queueName);
  }

  private getQueueWithValidation(queueName: string): [string, Channel] {
    const existingChannel: Channel | undefined = this.queues.get(queueName);
    if (!existingChannel)
      throw new Error(
        'No queue / channel to return from Rabbit-queue data source even there was a try to set a new one earlier!',
      );
    return [queueName, existingChannel];
  }
}
