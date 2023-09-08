// @ts-ignore
import * as nrf24 from 'nrf24';

class RadioService {
  private static instance: RadioService | null = null;
  public readonly isRadioBegin: boolean;
  public readonly hasFailure: boolean;
  public pipes: [number?, number?, number?, number?, number?] = [];
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

  constructor() {
    this.radio = new nrf24.nRF24(this.CeGpio, this.CsGpio);
    this.isRadioBegin = this.radio.begin();
    this.radio.config(this.nrfConfig);
    this.hasFailure = this.radio.hasFailure();
  }

  public static getInstance() {
    if (RadioService.instance) return RadioService.instance;
    return (RadioService.instance = new RadioService());
  }

  public addReadPipe(pipeDecimalNr: number): number {
    if (this.pipes.length >= 5)
      throw new Error('too many pipes to add a next one!');

    const createdPipe = this.radio.addReadPipe(
      this.getPipePaddedHexAddress(pipeDecimalNr),
    );
    this.pipes.push(createdPipe);
    return createdPipe;
  }

  public startReading(pipeToListen: number, callback: (x: string) => void) {
    this.radio.read(
      (data: Array<{ pipe: number; data: Buffer }>, items: number): void => {
        let messageFromPipeToListen = '';
        for (let i = 1; i <= items; i++) {
          if (data[items - 1].pipe !== pipeToListen) return;
          messageFromPipeToListen += data[items - 1].data;
        }
        callback(messageFromPipeToListen);
        messageFromPipeToListen = '';
      },
      (isStopped: unknown, by_user: unknown, error_count: unknown): void => {
        throw new Error(
          `RADIO STOPPED! ->  ${isStopped}, by user: ${by_user}, errorcount: ${error_count}`,
        );
      },
    );
  }

  private getPipePaddedHexAddress(decimalAddress: number): string {
    const hexAddress: string = decimalAddress.toString(16).toUpperCase();
    return `0x${hexAddress.padStart(this.padding, '0')}`;
  }
}

export default RadioService;
