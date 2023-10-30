import {
  createLogger,
  transports,
  format as winstonFormat,
  Logger as LoggerWinston,
} from 'winston';
import {
  ConsoleTransportInstance,
  FileTransportInstance,
} from 'winston/lib/winston/transports';
import SentryTransport from 'winston-transport-sentry-node/dist/transport';
import { TransformableInfo } from 'logform';
import ConfigBuilder from '../../config-builder/Config-builder';
import { configType } from '../../config-builder/config.type';
import { LoggerLevelEnum } from '../log-level/logger-level.enum';
import { ErrorLog } from '../error-log/error-log.instance';
import { InfoLog } from '../info-log/info-log.instance';

export class AppLogger {
  private static instance: AppLogger | null = null;
  private winstonLogger: LoggerWinston;
  private readonly config: configType = ConfigBuilder.getInstance().config;
  private readonly winstonFormat = winstonFormat;
  private readonly enabledTransports: Array<
    ConsoleTransportInstance | FileTransportInstance | SentryTransport
  > = [];

  private constructor() {
    if (this.config.usedLoggers.console) {
      this.enabledTransports.push(
        new transports.Console(this.config.loggersDetails.console),
      );
    }

    if (this.config.usedLoggers.file) {
      this.enabledTransports.push(
        new transports.File(this.config.loggersDetails.file),
      );
    }

    if (this.config.usedLoggers.sentry) {
      this.enabledTransports.push(
        new SentryTransport({
          sentry: {
            dsn: this.config.loggersDetails.sentry.dsn,
          },
          level: this.config.loggersDetails.sentry.level,
        }),
      );
    }

    this.winstonLogger = this.getLogger();
  }

  public static getInstance(): AppLogger {
    if (AppLogger.instance) {
      return AppLogger.instance;
    }
    return (AppLogger.instance = new AppLogger());
  }

  public log(logPayload: ErrorLog | InfoLog) {
    let level = LoggerLevelEnum.INFO;
    if (logPayload instanceof ErrorLog) level = logPayload.level;
    this.winstonLogger.log(level, logPayload);
  }

  private getLogger() {
    const { combine, label, timestamp, splat } = this.winstonFormat;

    return createLogger({
      format: combine(
        label({ label: this.config.appName }),
        timestamp(),
        splat(),
        this.ignorePrivate(),
        this.generateCustomFormat(),
      ),
      transports: this.enabledTransports,
      exitOnError: this.config.loggersDetails.exitOnError,
    });
  }

  private generateCustomFormat() {
    return this.winstonFormat.printf((data: TransformableInfo): string => {
      if (data.source === 'express') {
        // That's express log format
        return `[${data.timestamp}] [${data.label}] [exp] [${data.level}] ${data.message}`;
      } else {
        // If error is instance of Error then 'unpack' data. Otherwise error will not be converted into string correclty.
        if (data.error instanceof Error) {
          data.error = {
            name: data.error.name,
            message: data.error.message,
          };
        }
        return `[${data.timestamp}] [${data.label}] [app] [${data.level}] [${
          data.requestId || ''
        }] [${JSON.stringify(data)}]`;
      }
    });
  }

  private ignorePrivate() {
    return winstonFormat((data) => {
      if (data.private) {
        return false;
      }
      return data;
    })();
  }
}

export default AppLogger;
