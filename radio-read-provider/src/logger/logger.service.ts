import { appendFile } from 'fs/promises';
import Log from './log.entity';
import ConfigBuilder from '../config-builder/Config-builder';
import path from 'path';
import { ICustomException } from '../exceptions/custom-exception.interface';
import ApplicationException from '../exceptions/application.exception';
import { ExceptionLevel } from '../exceptions/dict/exception-level.enum';

const { config } = ConfigBuilder.getInstance();

class LoggerService {
  private static instance: LoggerService | null = null;
  private readonly fullPath: string;

  private constructor() {
    this.fullPath = path.join(
      ...config.fileLogger.path,
      config.fileLogger.fileName,
    );
  }

  public static getInstance() {
    if (LoggerService.instance) return LoggerService.instance;
    return (LoggerService.instance = new LoggerService());
  }

  public async saveLogToFile(log: Log) {
    try {
      await appendFile(this.fullPath, this.buildTxtLog(log) + '\n');
    } catch (err) {
      throw new ApplicationException(
        'Could not add a log to file',
        ExceptionLevel.ERROR,
        { cause: err },
      );
    }
  }

  private buildTxtLog(log: Log): string {
    try {
      const { appName, timestamp, level, message, data }: Log = log;
      let serializedData;

      if (data instanceof Error) {
        serializedData = JSON.stringify(
          this.mapErrorToSerializableObject(data),
          this.errorReplacer,
        );
      } else serializedData = JSON.stringify(data);

      return `[${appName}] [${timestamp}] ${JSON.stringify({
        level,
        message,
        data: serializedData,
      })}`;
    } catch (err) {
      throw new ApplicationException(
        'Could not build a log text',
        ExceptionLevel.ERROR,
        { cause: err },
      );
    }
  }

  private mapErrorToSerializableObject(error: ICustomException): object {
    return {
      name: error.name,
      message: error.message,
      level: error.level,
      stack: error.stack,
      cause: error.cause,
      data: error.data,
    };
  }

  private errorReplacer(key: string, value: unknown) {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
        cause: value.cause,
      };
    }
    return value;
  }
}

export default LoggerService;
