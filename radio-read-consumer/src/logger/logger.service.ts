import { appendFile } from 'fs/promises';
import { Express } from 'express';
import Log from './log.entity';
import ConfigBuilder from '../config-builder/Config-builder';
import path from 'path';
import { ICustomException } from '../exceptions/custom-exception.interface';
import ApplicationException from '../exceptions/application.exception';
import { Level } from './dict/level.enum';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

const { config } = ConfigBuilder.getInstance();

class LoggerService {
  private static instance: LoggerService | null = null;
  private readonly fullPath: string;
  // @ts-ignore
  private sentry;

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

  public initSentry(app: Express) {
    this.sentry = Sentry;
    this.sentry.init({
      ...config.sentry,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.Integrations.Express({ app: app }),
        new ProfilingIntegration(),
      ],
    });

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use(Sentry.Handlers.errorHandler());
  }

  public logError(log: Log): void {
    if (config.usedLoggers.sentry) this.logErrorToSentry(log);
    if (config.usedLoggers.file) this.logAllToFile(log);
    if (config.usedLoggers.console)
      console.log('[ERROR: ]', log.message, log.level);
  }

  public logInfo(log: Log): void {
    if (config.usedLoggers.sentry) this.logInfoToSentry(log);
    if (config.usedLoggers.file) this.logAllToFile(log);
    if (config.usedLoggers.console)
      console.log(
        '[INFO: ]',
        log.message,
        log.details.details ? log.details.details : '',
      );
  }

  private logInfoToSentry(log: Log): void {
    try {
      if (this.sentry) {
        const sentryArgs = [
          log.message,
          {
            level: log.level,
            tags: {
              appName: log.appName,
            },
            extra: { ...log.details, timestamp: log.timestamp },
          },
        ];
        this.sentry.captureMessage(...sentryArgs);
      } else {
        throw new Error('You should init Sentry!');
      }
    } catch (err) {
      const error = new ApplicationException(
        'You should init Sentry!',
        Level.WARNING,
        { cause: err },
      );
      this.logAllToFile(new Log(error));
      throw error;
    }
  }

  private logErrorToSentry(log: Log): void {
    try {
      if (this.sentry) {
        let serializedData: string = '';

        if (log.details instanceof Error) {
          serializedData = JSON.stringify(
            this.mapErrorToSerializableObject(log.details),
            this.errorReplacer,
          );
        }

        const sentryArgs = [
          log.details,
          {
            level: log.level,
            tags: {
              appName: log.appName,
            },
            extra: { ...log.details, timestamp: log.timestamp, serializedData },
          },
        ];

        this.sentry.captureException(...sentryArgs);
      } else {
        throw new Error('You should init Sentry!');
      }
    } catch (err) {
      const error = new ApplicationException(
        'You should init Sentry!',
        Level.WARNING,
        { cause: err },
      );
      this.logAllToFile(new Log(error));
      throw error;
    }
  }

  private logAllToFile(log: Log): void {
    try {
      // no async await to not slow down. Timestamp is ok
      appendFile(this.fullPath, this.buildTxtLog(log) + '\n');
    } catch (err) {
      const error = new ApplicationException(
        'Could not add a log to file',
        Level.ERROR,
        { cause: err },
      );
      this.logErrorToSentry(new Log(error));
    }
  }

  private buildTxtLog(log: Log): string | undefined {
    try {
      const { appName, timestamp, level, message, details }: Log = log;
      let serializedData;

      if (details instanceof Error) {
        serializedData = JSON.stringify(
          this.mapErrorToSerializableObject(details),
          this.errorReplacer,
        );
      } else serializedData = JSON.stringify(details);

      return `[${appName}] [${timestamp}] ${JSON.stringify({
        level,
        message,
        data: serializedData,
      })}`;
    } catch (err) {
      const error = new ApplicationException(
        'Could not build a text log for file logger',
        Level.ERROR,
        { cause: err },
      );
      this.logErrorToSentry(new Log(error));
    }
  }

  private mapErrorToSerializableObject(error: ICustomException): object {
    return {
      name: error.name,
      message: error.message,
      level: error.level,
      stack: error.stack,
      cause: error.cause,
      details: error.details,
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
