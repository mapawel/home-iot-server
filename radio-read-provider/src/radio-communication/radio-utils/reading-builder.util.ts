import Message from '../entities/message.entity';
import RadioException from '../../exceptions/radio.exception';
import { RadioExceptionCode } from '../../exceptions/dict/exception-codes.enum';
import { ExceptionLevel } from '../../exceptions/dict/exception-level.enum';
import ExceptionManagerService from '../../exceptions/exception-manager.service';
import { LogLevel } from '../../logger/dict/log-level.enum';

class ReadingBuilder {
  private textMessageFragments: string[] = [];
  private readTextMessage: string = '';
  private parsedMessage: Message | null = null;
  private readonly startMark = '>';
  private readonly finishMark = '<';
  private isMsgStarted: boolean;

  private readonly exceptionManager: ExceptionManagerService =
    ExceptionManagerService.getInstance();

  public async getFinalMergedMessage(
    textMessageFragment: string,
    callback: (message: Message) => void,
  ): Promise<void> {
    const message: Message | null =
      await this.mergeReadMessageFragments(textMessageFragment);
    if (!message) return;
    callback(message);
  }

  private async mergeReadMessageFragments(
    messageFragment: string,
  ): Promise<Message | null> {
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
        ExceptionLevel.ERROR,
        { cause: err },
      );
      await this.exceptionManager.logException(LogLevel.EXCEPTION, error);
      throw error;
    }
  }

  private clearReadings() {
    this.textMessageFragments.length = 0;
    this.readTextMessage = '';
  }

  private joinFragments() {
    this.readTextMessage = this.textMessageFragments.join();
  }

  // todo ADD VALIDATION HERE! ! !
  private parseTextMessage() {
    const textMessageBlocks: string[] = this.readTextMessage.split('|');
    this.parsedMessage = new Message(
      textMessageBlocks[0],
      textMessageBlocks[1],
      textMessageBlocks[2],
    );
  }

  private addFragment(messageFragment: string) {
    this.textMessageFragments.push(messageFragment);
  }
}

export default ReadingBuilder;
