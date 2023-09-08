import nrf24, {
  RF24Options,
  RF24_PA_HIGH,
  RF24_1MBPS,
  RF24_CRC_16,
  // @ts-ignore
} from 'nrf24';

class RadioService {
  private static instance: RadioService | null = null;
  public readonly isRadioBegin: boolean;
  public readonly hasFailure: boolean;
  private readonly nrfConfig: RF24Options = {
    PALevel: RF24_PA_HIGH,
    DataRate: RF24_1MBPS,
    Channel: 100,
    CRCLength: RF24_CRC_16,
    retriesCount: 10,
    AutoAck: true,
  };
  private readonly CEgpio = 17;
  private readonly CSgpio = 0;
  private readonly radio: nrf24;
  private pipes: [number, number?, number?, number?, number?];

  constructor() {
    this.radio = new nrf24.nrf24(this.CEgpio, this.CSgpio);
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
      this.getPipePaddedHexAddress(pipeDecimalNr, 10),
    );
    this.pipes.push(createdPipe);
    return createdPipe;
  }

  public startReading() {
    this.radio.read(
      function (data: [{ pipe: string; data: Buffer }], frames: number) {
        for (let i = 1; i <= frames; i++) {
          console.log(
            `>>> all frames: ${frames}.`,
            `Frame no ${frames}: `,
            `pipe: ${data[frames - 1]?.pipe}`,
            `DATA: ${data[frames - 1]?.data}`,
            '<<<',
          );
        }
      },
      function (isStopped: unknown, by_user: unknown, error_count: unknown) {
        console.log('RADIO STOPPED! -> ', isStopped, by_user, error_count);
      },
    );
  }

  private getPipePaddedHexAddress(
    decimalAddress: number,
    paddNr: number,
  ): string {
    const hexAddress: string = decimalAddress.toString(16).toUpperCase();
    return `0x${hexAddress.padStart(paddNr, '0')}`;
  }
}

export default RadioService;
