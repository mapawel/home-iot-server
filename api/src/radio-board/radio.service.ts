// @ts-ignore
import * as nrf24 from 'nrf24';
import {InternalServiceException} from '../exceptions/internal-services-exceptions/internal-service.exception';

class RadioService {
    private static instance: RadioService | null = null;
    public readonly isRadioBegin: boolean;
    public readonly present: boolean;
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

    public addReadPipe(pipeDecimalNr: number): number {
        if (this.pipes.length >= 5)
            throw new Error('too many pipes to add a next one!');

        const createdPipe = this.radio.addReadPipe(
            this.getPipePaddedHexAddress(pipeDecimalNr),
        );
        this.pipes.push(createdPipe);
        return createdPipe;
    }

    public startReadingAndProceed(
        pipeToListen: number,
        callback: (textMessageFragment: string) => void,
    ) {
        this.radio.stopWrite();
        this.radio.stopRead();

        this.radio.read(
            (data: Array<{ pipe: number; data: Buffer }>, items: number): void => {
                let messageFromPipeToListen = '';
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

                if (by_user) return;

                const radioError: InternalServiceException =
                    new InternalServiceException(
                        `RADIO STOPPED not by user! Errorcount: ${error_count}`,
                    );
                // LOG ERROR TO EXTERNAL LOGGS + WARN TO APP AND MOBILE PHONE ! ! !
                console.warn('>>> ', radioError);
            },
        );
    }

    private getPipePaddedHexAddress(decimalAddress: number): string {
        const hexAddress: string = decimalAddress.toString(16).toUpperCase();
        return `0x${hexAddress.padStart(this.padding, '0')}`;
    }
}

export default RadioService;
