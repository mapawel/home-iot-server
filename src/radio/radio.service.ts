// import nrf24 from
// class RadioService {
//   private static instance: RadioService | null = null;
//   private readonly nrfConfig = {
//     PALevel: nrf24.RF24_PA_HIGH,
//     DataRate: nrf24.RF24_1MBPS,
//     Channel: 100,
//     CRCLength: nrf24.RF24_CRC_16,
//     retriesCount: 10,
//     AutoAck: true,
//   };
//
//   constructor() {}
//
//   public static getInstance() {
//     if (RadioService.instance) return RadioService.instance;
//     return (RadioService.instance = new RadioService());
//   }
// }
//
// export default RadioService;
