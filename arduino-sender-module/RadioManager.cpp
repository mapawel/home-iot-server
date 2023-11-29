#include "RadioManager.h"

#define CE_PIN 9
#define CSN_PIN 10
RF24 radio(CE_PIN, CSN_PIN);


RadioManager::RadioManager(const uint64_t inputAddress) : address(inputAddress) {}

void RadioManager::radioInit() {
  if (!radio.begin()) {
    Serial.println("radio hardware is not responding!!");
    while (1) {}
  }

  radio.setChannel(100);
  radio.setPALevel(RF24_PA_LOW);
  radio.openWritingPipe(address);
  radio.stopListening();
}


void RadioManager::sendRadioMessage(char** messageFragments, size_t messageFragmentsNum) {
  radio.flush_tx();
  uint8_t i = 0;
  uint8_t failures = 0;
  unsigned long start_timer = micros();

  while (i < messageFragmentsNum) {
    if (!radio.write(messageFragments[i], strlen(messageFragments[i]))) {
      failures++;
      // radio.reUseTX();
    } else {
      i++;
    }

    if (failures >= 100) {
      Serial.print(F("Too many failures detected. Aborting at payload "));
      break;
    }
  }

  unsigned long end_timer = micros();

  log(start_timer, end_timer, failures);

  i = 0;
}

void RadioManager::log(unsigned long start_timer, unsigned long end_timer, uint8_t failures) {
  Serial.print(F("Time to transmit = "));
  Serial.print((end_timer - start_timer) / 1000);
  Serial.print(F(" ms with "));
  Serial.print(failures);
  Serial.println(F(" failures detected"));
}

