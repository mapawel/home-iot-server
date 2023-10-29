import { Channel, connect, Connection } from 'amqplib';
import ConfigBuilder from '../config-builder/Config-builder';
import { configType } from '../config-builder/config.type';
import RabbitException from '../exceptions/rabbit.exception';
import {
  ApplicationExceptionCode,
  RabbitExceptionCode,
} from '../exceptions/dict/exception-codes.enum';
import { rabbitChannelNames } from './rabbit-channel-names.enum';
import AppLogger from '../loggers/logger-service/logger.service';
import { ErrorLog } from '../loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from '../loggers/log-level/logger-level.enum';
import ApplicationException from '../exceptions/application.exception';
import { InfoLog } from '../loggers/info-log/info-log.instance';

const {
  config: {
    rabbitmq: { host, user, pass },
  },
}: { config: configType } = ConfigBuilder.getInstance();

class RabbitQueueDataSource {
  private static config: configType = ConfigBuilder.getInstance().config;
  private static instance: RabbitQueueDataSource | null = null;
  private readonly maxRetriesToRabbitConnections = 10;
  private connectionToRabbitAttempt = 1;
  private readonly connectionRetryDelay = 2000;
  private readonly maxRetriesToMsgProceed = 5;
  private proceedMsgAttempts = 1;
  private readonly proceedMsgDelay = 300;
  private readonly maxRetriesToMsgSend = 5;
  private sendMsgAttempts = 1;
  private readonly sendMsgDelay = 300;
  private connection: Connection | null;
  private queues: Map<string, Channel> = new Map();
  private listeners: Map<string, (msg: string) => void> = new Map();
  private readonly appLogger: AppLogger = AppLogger.getInstance();

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

      if (!sendResponse) {
        if (this.sendMsgAttempts <= this.maxRetriesToMsgSend) {
          this.appLogger.log(
            new ErrorLog(
              new RabbitException(RabbitExceptionCode.MESSAGES_SENDING_ERROR),
              LoggerLevelEnum.WARN,
              {
                info: `Attempt to send Rabbit message ${this.sendMsgAttempts} failed. It will continue till ${this.maxRetriesToMsgSend} try.`,
                details: {
                  msgToSend: message,
                  queueName: name,
                },
              },
            ),
          );
          await new Promise((resolve) =>
            setTimeout(resolve, this.sendMsgDelay),
          );
          this.sendMsgAttempts += 1;
          return this.sendMessage(queueName, message);
        }
        this.sendMsgAttempts = 1;
        const error = new RabbitException(
          RabbitExceptionCode.MESSAGES_SENDING_ERROR,
        );
        this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
        await this.sendMessage(rabbitChannelNames.ERRORS, message);

        throw error;
      }
    } catch (err) {
      const error =
        err instanceof RabbitException
          ? err
          : new RabbitException(RabbitExceptionCode.MESSAGES_SENDING_ERROR, {
              cause: err,
            });
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
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

      return channel.consume(name, async (msg) => {
        if (msg) {
          try {
            const stringMessage: string | undefined = msg?.content.toString();
            if (stringMessage) await callback(stringMessage);
          } catch (err) {
            if (this.proceedMsgAttempts <= this.maxRetriesToMsgProceed) {
              this.appLogger.log(
                new ErrorLog(
                  new ApplicationException(
                    ApplicationExceptionCode.PROCEEDING_FLOW_ERROR,
                    {
                      cause: err,
                    },
                  ),
                  LoggerLevelEnum.WARN,
                  {
                    info: `Attempt to proceed Rabbit message ${this.proceedMsgAttempts} failed. It will continue till ${this.maxRetriesToMsgProceed} try.`,
                    details: {
                      msgReceived: msg?.content.toString(),
                      channel: name,
                    },
                  },
                ),
              );
              await new Promise((resolve) =>
                setTimeout(resolve, this.proceedMsgDelay),
              );
              this.proceedMsgAttempts += 1;
              return channel.nack(msg);
            }
            this.proceedMsgAttempts = 1;
            const error = new ApplicationException(
              ApplicationExceptionCode.PROCEEDING_FLOW_ERROR,
              { cause: err },
            );
            this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
            await this.sendMessage(
              rabbitChannelNames.ERRORS,
              msg?.content.toString(),
            );

            throw error; // rzucam tu błędem, bo w tym wypadku jeśli nie uda się odczytać z rabbita to apka nie ma prawa działać i chcę ją zatrzymać
          }
          channel.ack(msg);
        }
      });
    } catch (err) {
      const error = new RabbitException(
        RabbitExceptionCode.MESSAGES_READING_ERROR,
        { cause: err },
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
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

      this.appLogger.log(
        new InfoLog(`Connected to Rabbit queue: ${queueName}`),
      );

      return this.getQueueWithValidation(queueName);
    } catch (err) {
      this.appLogger.log(
        new ErrorLog(
          new RabbitException(RabbitExceptionCode.CONNECTION_ERROR),
          LoggerLevelEnum.WARN,
          `Try to connect nr ${this.connectionToRabbitAttempt} ...`,
        ),
      );

      if (this.connectionToRabbitAttempt < this.maxRetriesToRabbitConnections) {
        this.connectionToRabbitAttempt += 1;
        await new Promise((resolve) =>
          setTimeout(resolve, this.connectionRetryDelay),
        );
        return await this.startNewQueueOrGetExisting(queueName);
      }
      const error = new RabbitException(
        RabbitExceptionCode.CONNECTION_ERROR,
        { cause: err },
        `Tries to connect: ${this.connectionToRabbitAttempt}`,
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
  }

  private async retryClosedConnection(queueName: string): Promise<void> {
    this.connection = null;
    this.queues.delete(queueName);
    this.appLogger.log(new InfoLog('! CONNECTION CLOSED! Starting again...'));
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
