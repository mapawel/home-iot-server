import { ReadingBuilderMessageHandler } from '../reading-bulider-message-handler.interface';
import Message from '../../entities/message.entity';
import { RabbitChannelNames } from '../../../data-sources/rabbit/rabbit-channel-names.enum';
import ApplicationException from '../../../exceptions/application.exception';
import { ApplicationExceptionCode } from '../../../exceptions/dict/exception-codes.enum';
import { ErrorLog } from '../../../loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from '../../../loggers/log-level/logger-level.enum';
import RabbitQueueDataSource from '../../../data-sources/rabbit/rabbit-queue.data-source';
import AppLogger from '../../../loggers/logger-service/logger.service';

export class ReadingBuilderHandler implements ReadingBuilderMessageHandler {
  private readonly appLogger: AppLogger = AppLogger.getInstance();
  private readonly rabbitQueueDataSource: RabbitQueueDataSource =
    new RabbitQueueDataSource();

  public async proceedMessage(message: Message): Promise<void> {
    try {
      //todo to remove clg
      console.log('-> ', message);
      await this.rabbitQueueDataSource.sendMessage(
        RabbitChannelNames.MESSAGES,
        JSON.stringify(message),
      );
    } catch (err) {
      const error = new ApplicationException(
        ApplicationExceptionCode.UNKNOWN_ERROR,
        { cause: err },
        'Problem in callback passed to getFinalMergedMessage. Message not proceeded!',
      );
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
  }
}
