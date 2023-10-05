// @ts-ignore
import * as nrf24 from 'nrf24';
import RadioException from '../exceptions/radio.exception';
import { RadioExceptionCode } from '../exceptions/dict/exception-codes.enum';
import { ExceptionLevel } from '../exceptions/dict/exception-level.enum';
import ExceptionManagerService from '../exceptions/exception-manager.service';
import { LogLevel } from '../logger/dict/log-level.enum';
import Log from '../logger/log.entity';
import LoggerService from '../logger/logger.service';

class RadioService {
  private static instance: RadioService | null = null;
  public readonly isRadioBegin: boolean;
  public readonly present: boolean;
  public readonly hasFailure: boolean;
  public pipes: Map<string, number> = new Map();
  public listenedPipes: Map<number, number> = new Map();
  private readonly radio: nrf24.nRF24;
  private readonly nrfConfig: nrf24.RF24Options = {
    PALevel: nrf24.RF24_PA_HIGH,
    DataRate: nrf24.RF24_1MBPS,
    Channel: 100,
    CRCLength: nrf24.RF24_CRC_16,
    retriesCount: 10,
    AutoAck: true,
    AddressWidth: 5,
  };
  private readonly padding = 10; //AddressWidth = 50, padding has to be 10 !
  private readonly CeGpio = 17;
  private readonly CsGpio = 0;

  private readonly exceptionManager: ExceptionManagerService =
    ExceptionManagerService.getInstance();
  private readonly loggerService: LoggerService = LoggerService.getInstance();

  private constructor() {
    this.radio = new nrf24.nRF24(this.CeGpio, this.CsGpio);
    this.isRadioBegin = this.radio.begin();
    this.present = this.radio.present();
    this.hasFailure = this.radio.hasFailure();
    this.radio.config(this.nrfConfig);
  }

  public static getInstance() {
    if (RadioService.instance) return RadioService.instance;
    return (RadioService.instance = new RadioService());
  }

  public getOrAddNewReadPipe(pipeDecimalNr: number): number {
    try {
      const pipePaddedHexAddress: string =
        this.getPipePaddedHexAddress(pipeDecimalNr);

      const existingPipe: number | undefined =
        this.pipes.get(pipePaddedHexAddress);

      if (existingPipe) return existingPipe;

      if (this.pipes.size >= 5)
        throw new Error('Too many pipes to add a next one!');
      const createdPipe = this.radio.addReadPipe(pipePaddedHexAddress);

      this.pipes.set(pipePaddedHexAddress, createdPipe);
      return createdPipe;
    } catch (err) {
      const error = new RadioException(
        RadioExceptionCode.CONNECTION_ERROR,
        ExceptionLevel.FATAL,
        { cause: err },
      );
      this.exceptionManager.logException(LogLevel.EXCEPTION, error);
      throw error;
    }
  }

  public startReadingAndProceed(
    pipeToListen: number,
    callback: (textMessageFragment: string) => void,
  ): void {
    try {
      if (this.listenedPipes.get(pipeToListen)) return;
      console.log(
        '====>>> passed pipe nr to listen to radio module to start listen: ',
        pipeToListen,
      );
      this.radio.stopWrite();

      this.radio.read(
        (data: Array<{ pipe: number; data: Buffer }>, items: number): void => {
          let messageFromPipeToListen = '';
          console.log(
            `=====>>>> data received raw for pipe passed nr ${pipeToListen}:  `,
            JSON.stringify(data),
          );
          for (let i = 0; i < items; i++) {
            if (data[i].pipe !== pipeToListen) continue;
            messageFromPipeToListen += data[i].data.toString();
          }
          callback(messageFromPipeToListen);
        },
        (isStopped: unknown, by_user: unknown, error_count: unknown): void => {
          if (process.env.HOST_SYSTEM === 'macos')
            return console.log(
              `RADIO STOPPED but you are on Mac so this is normal behaviour! ->  ${isStopped}, by user: ${by_user}, errorcount: ${error_count}`,
            );

          if (by_user)
            return console.log(
              `RADIO STOPPED by user ->  ${isStopped}, by user: ${by_user}, errorcount: ${error_count}`,
            );

          throw new Error(
            `RADIO STOPPED not by user! Errorcount: ${error_count}`,
          );
        },
      );

      this.listenedPipes.set(pipeToListen, pipeToListen);

      const log: Log = new Log({
        level: LogLevel.INFO,
        message: `Radio is listening on pipe nr ${pipeToListen} ...`,
        data: { radioPipe: pipeToListen },
      });
      this.loggerService.saveLogToFile(log);
      console.log(`Radio is listening on pipe nr ${pipeToListen} ...`);
    } catch (err) {
      const error = new RadioException(
        RadioExceptionCode.MESSAGE_READ_ERROR,
        ExceptionLevel.FATAL,
        { cause: err },
      );
      this.exceptionManager.logException(LogLevel.EXCEPTION, error);
      throw error;
    }
  }

  private getPipePaddedHexAddress(decimalAddress: number): string {
    const hexAddress: string = decimalAddress.toString(16).toUpperCase();
    return `0x${hexAddress.padStart(this.padding, '0')}`;
  }
}

export default RadioService;
