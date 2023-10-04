import LoggerService from '../logger/logger.service';
import { ICustomException } from './custom-exception.interface';
import Log from '../logger/log.entity';
import { LogLevel } from '../logger/dict/log-level.enum';

class ExceptionManagerService {
  private static instance: ExceptionManagerService | null = null;
  private readonly loggerService: LoggerService = LoggerService.getInstance();

  private constructor() {}

  public static getInstance() {
    if (ExceptionManagerService.instance)
      return ExceptionManagerService.instance;
    return (ExceptionManagerService.instance = new ExceptionManagerService());
  }

  public async logAndThrowException(
    logLevel: LogLevel,
    exception: ICustomException,
  ) {
    await this.logException(logLevel, exception);
    throw exception;
  }

  public async logException(logLevel: LogLevel, exception: ICustomException) {
    const log = new Log({
      level: logLevel,
      message: exception.message,
      data: exception,
    });
    await this.loggerService.saveLogToFile(log);
  }
}

export default ExceptionManagerService;
