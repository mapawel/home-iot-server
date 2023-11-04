import AppLogger from '../../../loggers/logger-service/logger.service';
import { RadioMesssageHandler } from '../../../radio-board/radio-messsage-handler.interface';
import ReadingBuilder from '../../radio-utils/reading-builder.util';
import { RadioExceptionCode } from '../../../exceptions/dict/exception-codes.enum';
import { ErrorLog } from '../../../loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from '../../../loggers/log-level/logger-level.enum';
import RadioException from '../../../exceptions/radio.exception';
import { ReadingBuilderHandler } from '../../radio-utils/reading-builder-message-handlers/reading-builder.handler';

export class RadioMessageMessageHandler implements RadioMesssageHandler {
  private readonly appLogger: AppLogger = AppLogger.getInstance();
  private readonly readingBuilder: ReadingBuilder = new ReadingBuilder(
    new ReadingBuilderHandler(),
  );

  public async proceedRadioMessage(
    radioMessageFragment: string,
  ): Promise<void> {
    try {
      await this.handleMessageFragment(radioMessageFragment);
    } catch (err) {
      throw err;
    }
  }

  private async handleMessageFragment(messageFragment: string) {
    try {
      await this.readingBuilder.getFinalMergedMessage(messageFragment);
    } catch (err) {
      const error = new RadioException(RadioExceptionCode.MESSAGE_READ_ERROR, {
        cause: err,
      });
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      // throw error; //DONT THROW TO NOT STOP THE APP !!!
    }
  }
}
