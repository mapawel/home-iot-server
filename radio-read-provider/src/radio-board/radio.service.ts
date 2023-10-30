// @ts-ignore
import * as nrf24 from 'nrf24';
import RadioException from '../exceptions/radio.exception';
import { RadioExceptionCode } from '../exceptions/dict/exception-codes.enum';
import AppLogger from '../loggers/logger-service/logger.service';
import { ErrorLog } from '../loggers/error-log/error-log.instance';
import { LoggerLevelEnum } from '../loggers/log-level/logger-level.enum';
import { InfoLog } from '../loggers/info-log/info-log.instance';

class RadioService {
  private static instance: RadioService | null = null;
  public readonly isRadioBegin: boolean;
  public readonly present: boolean;
  public readonly hasFailure: boolean;
  public pipes: Map<string, number> = new Map();
  public listenedPipes: Map<number, number> = new Map();
  private isReadCallback: boolean = false;
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

  private readonly appLogger: AppLogger = AppLogger.getInstance();

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
      const error = new RadioException(RadioExceptionCode.CONNECTION_ERROR, {
        cause: err,
      });
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
  }

  public startReadingAndProceed(
    pipeToListen: number,
    callback: (textMessageFragment: string) => void,
  ): void {
    try {
      if (this.listenedPipes.get(pipeToListen)) return;
      this.radio.stopWrite();

      if (!this.isReadCallback)
        this.radio.read(
          async (
            data: Array<{ pipe: number; data: Buffer }>,
            items: number,
          ): Promise<void> => {
            try {
              this.isReadCallback = true;
              let messageFromPipeToListen = '';
              for (let i = 0; i < items; i++) {
                if (!this.listenedPipes.get(data[i].pipe)) continue;
                messageFromPipeToListen += data[i].data.toString();
              }
              await callback(messageFromPipeToListen);
            } catch (err) {
              const error = new RadioException(
                RadioExceptionCode.MESSAGE_READ_ERROR,
                { cause: err },
                'module not known - the error is in startReadingAndProceed in radio service',
              );
              this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
              // throw error; // todo to consider, probably to not throw
            }
          },
          (
            isStopped: unknown,
            by_user: unknown,
            error_count: unknown,
          ): void => {
            if (process.env.HOST_SYSTEM === 'macos')
              return console.log(
                `RADIO STOPPED but you are on Mac so this is normal behaviour! ->  ${isStopped}, by user: ${by_user}, errorcount: ${error_count}`,
              );

            if (by_user)
              throw new Error(
                `RADIO STOPPED by user ->  ${isStopped}, by user: ${by_user}, errorcount: ${error_count}`,
              );

            throw new Error(
              `RADIO STOPPED not by user! Errorcount: ${error_count}`,
            );
          },
        );

      this.listenedPipes.set(pipeToListen, pipeToListen);

      this.appLogger.log(
        new InfoLog(`Radio is listening on pipe nr ${pipeToListen}`, {
          allListenedPipes: this.listenedPipes,
        }),
      );
    } catch (err) {
      const error = new RadioException(RadioExceptionCode.UNKNOWN_ERROR, {
        cause: err,
      });
      this.appLogger.log(new ErrorLog(error, LoggerLevelEnum.ERROR));
      throw error;
    }
  }

  private getPipePaddedHexAddress(decimalAddress: number): string {
    const hexAddress: string = decimalAddress.toString(16).toUpperCase();
    return `0x${hexAddress.padStart(this.padding, '0')}`;
  }
}

export default RadioService;
