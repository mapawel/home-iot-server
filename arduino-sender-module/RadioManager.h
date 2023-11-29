#ifndef RADIO_MANAGER_H
#define RADIO_MANAGER_H

#include <SPI.h>
#include "RF24.h"

class RadioManager {
public:
  RadioManager(const uint64_t inputAddress);
  void radioInit();
  void sendRadioMessage(char** messageFragments, size_t messageFragmentsNum);

private:
  const uint64_t address;
  void log(unsigned long start_timer, unsigned long end_timer, uint8_t failures);
};

#endif // RADIO_MANAGER_H