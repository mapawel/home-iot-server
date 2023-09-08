declare namespace nrf24 {
  interface RF24Options {
    PALevel?: 'MIN' | 'LOW' | 'HIGH' | 'MAX';
    EnableLna?: boolean;
    DataRate?: '2MBPS' | '1MBPS' | '250KB';
    Channel?: number;
    CRCLength?: '8bit' | '16bit' | 'disabled';
    retriesCount?: number;
    retriesDelay?: number;
    PayloadSize?: number;
    AddressWidth?: number;
    AutoAck?: boolean;
    Irq?: number;
    PollBaseTime?: number;
    TxDelay?: number;
  }

  interface ReadCallback {
    (data: Array<{ pipe: number; data: Buffer }>, items: number): void;
  }

  interface StopCallback {
    (stopped: boolean, by_user: boolean, error_count: number): void;
  }

  interface WriteCallback {
    (
      success: boolean,
      tx_ok: number,
      tx_bytes: number,
      tx_req: number,
      frame_size: number,
      abort: boolean,
    ): void;
  }

  class nRF24 {
    constructor(CE: number, CS: number);

    destroy(): void;

    begin(print_debug?: boolean): boolean;

    config(options: RF24Options, print_details?: boolean): void;

    addReadPipe(addr: string, auto_ack?: boolean): number;

    removeReadPipe(pipe: number): void;

    changeReadPipe(pipe: number, auto_ack: boolean, maxmerge: number): void;

    read(rcv_callback: ReadCallback, stop_callback: StopCallback): void;

    stopRead(): void;

    useWritePipe(addr: string, auto_ack?: boolean): void;

    changeWritePipe(auto_ack: boolean, stream_maxsize: number): void;

    write(buffer: Buffer, wr_callback?: WriteCallback): boolean;

    stream(buffer: Buffer, wr_callback: WriteCallback): boolean;

    stopWrite(): void;

    hasFailure(): void; // TODO: Specify return type
    restart(): void; // TODO: Specify return type
    getStats(pipe?: number): void; // TODO: Specify return type
  }
}

export = nrf24;
