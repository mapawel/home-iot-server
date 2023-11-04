import Message from '../entities/message.entity';
import { ApplicationExceptionCode } from '../../exceptions/dict/exception-codes.enum';
import ApplicationException from '../../exceptions/application.exception';
import getValidationService from '../../validation/validation.service';
import AppLogger from '../../loggers/logger-service/logger.service';
import { ErrorLog } from '../../loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from '../../loggers/log-level/logger-level.enum';
import { ReadingBuilderMessageHandler } from './reading-bulider-message-handler.interface';

class ReadingBuilder {
  private textMessageFragments: string[] = [];
  private readTextMessage: string = '';
  private parsedMessage: Message | null = null;
  private readonly startMark = '>';
  private readonly finishMark = '<';
  private isMsgStarted: boolean;
  private readonly appLoger: AppLogger = AppLogger.getInstance();

  constructor(
    private readonly readingBuilderMessageHandler: ReadingBuilderMessageHandler,
  ) {}

  public async getFinalMergedMessage(
    textMessageFragment: string,
  ): Promise<void> {
    try {
      const message: Message | null =
        this.mergeReadMessageFragments(textMessageFragment);
      if (!message) return;
      await this.readingBuilderMessageHandler.proceedMessage(message);
    } catch (err) {
      const error = new ApplicationException(
        ApplicationExceptionCode.PROCEEDING_FLOW_ERROR,
        { cause: err },
        'module not known, error is in getFinalMergedMessage',
      );
      this.appLoger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
  }

  private mergeReadMessageFragments(messageFragment: string): Message | null {
    try {
      const fragmentLength: number = messageFragment.length;
      const indexOfStartMark: number = messageFragment.indexOf(this.startMark);
      const indexOfFinishMark: number = messageFragment.indexOf(
        this.finishMark,
      );

      if (messageFragment.includes(this.startMark)) {
        this.clearReadings();
        this.addFragment(messageFragment.slice(indexOfStartMark + 1));
        this.isMsgStarted = true;
        return null;
      }
      if (messageFragment.includes(this.finishMark)) {
        if (!this.isMsgStarted) {
          this.clearReadings();
          return null;
        }
        this.addFragment(
          messageFragment.slice(0, indexOfFinishMark - fragmentLength),
        );
        this.joinFragments();
        this.parseTextMessage();

        return this.parsedMessage;
      }

      if (!this.isMsgStarted) {
        this.clearReadings();
        return null;
      }

      this.addFragment(messageFragment);

      return null;
    } catch (err) {
      const error = new ApplicationException(
        ApplicationExceptionCode.PROCEEDING_FLOW_ERROR,
        { cause: err },
        'module not known, error is in mergeReadMessageFragments',
      );
      this.appLoger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
  }

  private clearReadings(): void {
    this.textMessageFragments.length = 0;
    this.readTextMessage = '';
  }

  private joinFragments(): void {
    this.readTextMessage = this.textMessageFragments.join('');
  }

  private async parseTextMessage(): Promise<void> {
    try {
      const textMessageBlocks: string[] = this.readTextMessage.split('|');

      const [newMessage, error] = await getValidationService(Message, {
        moduleId: textMessageBlocks[0],
        encryptedData: textMessageBlocks[1],
        hash: textMessageBlocks[2],
      }).validateAndGetInstance();
      if (error)
        return this.appLoger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));

      this.parsedMessage = newMessage;
    } catch (err) {
      const error = new ApplicationException(
        ApplicationExceptionCode.PROCEEDING_FLOW_ERROR,
        { cause: err },
        'module not known, error is in parseTextMessage',
      );
      this.appLoger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
  }

  private addFragment(messageFragment: string): void {
    this.textMessageFragments.push(messageFragment);
  }
}

export default ReadingBuilder;
