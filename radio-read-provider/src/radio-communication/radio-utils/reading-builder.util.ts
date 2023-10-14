import Message from '../entities/message.entity';
import RadioException from '../../exceptions/radio.exception';
import { RadioExceptionCode } from '../../exceptions/dict/exception-codes.enum';
import { Level } from '../../logger/dict/level.enum';
import LoggerService from '../../logger/logger.service';
import Log from '../../logger/log.entity';
import ApplicationException from '../../exceptions/application.exception';

class ReadingBuilder {
  private textMessageFragments: string[] = [];
  private readTextMessage: string = '';
  private parsedMessage: Message | null = null;
  private readonly startMark = '>';
  private readonly finishMark = '<';
  private isMsgStarted: boolean;
  private readonly loggerService: LoggerService = LoggerService.getInstance();

  public async getFinalMergedMessage(
    textMessageFragment: string,
    callback: (message: Message) => void,
  ): Promise<void> {
    try {
      const message: Message | null =
        this.mergeReadMessageFragments(textMessageFragment);
      if (!message) return;
      await callback(message);
    } catch (err) {
      const error = new ApplicationException(
        'Could not get final merged message',
        Level.ERROR,
        { cause: err },
      );
      this.loggerService.logError(new Log(error));
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
      const error = new RadioException(
        RadioExceptionCode.MESSAGE_PARSE_ERROR,
        Level.ERROR,
        { cause: err },
      );
      this.loggerService.logError(new Log(error));
      throw error;
    }
  }

  private clearReadings(): void {
    this.textMessageFragments.length = 0;
    this.readTextMessage = '';
  }

  private joinFragments(): void {
    this.readTextMessage = this.textMessageFragments.join();
  }

  // todo ADD VALIDATION HERE! ! !
  private parseTextMessage(): void {
    try {
      const textMessageBlocks: string[] = this.readTextMessage.split('|');
      this.parsedMessage = new Message(
        textMessageBlocks[0],
        textMessageBlocks[1],
        textMessageBlocks[2],
      );
    } catch (err) {
      const error = new RadioException(
        RadioExceptionCode.MESSAGE_PARSE_ERROR,
        Level.ERROR,
        { cause: err },
      );
      this.loggerService.logError(new Log(error));
      throw error;
    }
  }

  private addFragment(messageFragment: string): void {
    this.textMessageFragments.push(messageFragment);
  }
}

export default ReadingBuilder;
