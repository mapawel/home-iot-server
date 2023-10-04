import { Channel, Connection, connect } from 'amqplib';
import ConfigBuilder from '../config-builder/Config-builder';
import { configType } from '../config-builder/config.type';
import RabbitException from '../exceptions/rabbit.exception';
import { RabbitExceptionCode } from '../exceptions/dict/exception-codes.enum';
import { ExceptionLevel } from '../exceptions/dict/exception-level.enum';
import ExceptionManagerService from '../exceptions/exception-manager.service';
import { LogLevel } from '../logger/dict/log-level.enum';
import LoggerService from '../logger/logger.service';
import Log from '../logger/log.entity';

const {
  config: {
    rabbitmq: { host, user, pass },
  },
}: { config: configType } = ConfigBuilder.getInstance();

class RabbitQueueDataSource {
  private static instance: RabbitQueueDataSource | null = null;
  private readonly maxRetriesToRabbitConnections = 10;
  private connectionToRabbitAttempt = 1;
  private readonly retryDelay = 2000;
  private connection: Connection | null;
  private queues: Map<string, Channel> = new Map();
  private listeners: Map<string, (msg: string) => void> = new Map();

  private readonly exceptionManager: ExceptionManagerService =
    ExceptionManagerService.getInstance();
  private readonly loggerService: LoggerService = LoggerService.getInstance();

  private constructor() {}

  public static getInstance() {
    if (RabbitQueueDataSource.instance) return RabbitQueueDataSource.instance;
    return (RabbitQueueDataSource.instance = new RabbitQueueDataSource());
  }

  public async sendMessage(queueName: string, message: string): Promise<void> {
    try {
      const [name, channel]: [string, Channel] =
        await this.startNewQueueOrGetExisting(queueName);

      const sendResponse: boolean = channel.sendToQueue(
        name,
        Buffer.from(message),
      );

      if (!sendResponse)
        throw new Error(`Message not sent! Message: ${message}`);
    } catch (err) {
      const error = new RabbitException(
        RabbitExceptionCode.MESSAGES_SENDING_ERROR,
        ExceptionLevel.ERROR,
        { cause: err },
      );
      await this.exceptionManager.logAndThrowException(
        LogLevel.EXCEPTION,
        error,
      );
    }
  }

  public async startMsgListener(
    queueName: string,
    callback: (msg: string) => void,
  ) {
    try {
      const [name, channel]: [string, Channel] =
        await this.startNewQueueOrGetExisting(queueName);

      this.listeners.set(name, callback);

      return channel.consume(name, (msg) => {
        const stringMessage: string | undefined = msg?.content.toString();
        if (msg) channel.ack(msg);
        if (stringMessage) callback(stringMessage);
      });
    } catch (err) {
      const error = new RabbitException(
        RabbitExceptionCode.MESSAGES_READING_ERROR,
        ExceptionLevel.FATAL,
        { cause: err },
      );
      await this.exceptionManager.logAndThrowException(
        LogLevel.EXCEPTION,
        error,
      );
    }
  }

  public async startNewQueueOrGetExisting(
    queueName: string,
  ): Promise<[string, Channel]> {
    try {
      if (!this.connection) {
        this.connection = await connect(`amqp://${user}:${pass}@${host}:5672`);

        this.connection.on(
          'close',
          async () => await this.retryClosedConnection(queueName),
        );
      }

      const searchedQueueChannel: Channel | undefined =
        this.queues.get(queueName);
      if (searchedQueueChannel) return [queueName, searchedQueueChannel];

      const newChannel: Channel = await this.connection.createChannel();
      await newChannel.assertQueue(queueName);

      this.queues.set(queueName, newChannel);

      const existingCallback = this.listeners.get(queueName);
      if (existingCallback)
        await this.startMsgListener(queueName, existingCallback);

      this.connectionToRabbitAttempt = 1;

      const log: Log = new Log({
        level: LogLevel.INFO,
        message: `Connected to Rabbit queue: ${queueName}`,
        data: { queueName },
      });
      await this.loggerService.saveLogToFile(log);
      console.log(`Connected to Rabbit queue: ${queueName}`);

      return this.getQueueWithValidation(queueName);
    } catch (err) {
      console.log(err);
      const log: Log = new Log({
        level: LogLevel.INFO,
        message: `Try to connect nr ${this.connectionToRabbitAttempt}`,
        data: err,
      });
      await this.loggerService.saveLogToFile(log);
      console.warn(`Try to connect nr ${this.connectionToRabbitAttempt}`);

      if (this.connectionToRabbitAttempt < this.maxRetriesToRabbitConnections) {
        this.connectionToRabbitAttempt += 1;
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return await this.startNewQueueOrGetExisting(queueName);
      }
      const error = new RabbitException(
        RabbitExceptionCode.CONNECTION_ERROR,
        ExceptionLevel.FATAL,
        { cause: err },
      );
      await this.exceptionManager.logException(LogLevel.EXCEPTION, error);
      console.error('Could not connect to Rabbit!');

      throw error;
    }
  }

  private async retryClosedConnection(queueName: string): Promise<void> {
    this.connection = null;
    this.queues.delete(queueName);
    console.log('>CONNECTION CLOSED! Starting again...');
    await this.startNewQueueOrGetExisting(queueName);
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

export default RabbitQueueDataSource;
