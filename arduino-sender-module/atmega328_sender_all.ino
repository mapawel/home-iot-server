#include "AesEncryptManager.h"
#include "HmacManager.h"
#include "RadioManager.h"
#include "MessageManager.h"
#include "TimeManager.h"

unsigned long previousTime;

const char* moduleId = "039e60c874a";
// // radio address
const uint64_t address = 100;
// SHA256 for HMAC sign
const char *key = "asdfghjklzxcvbnm";
// AES128 pass and vector to encrypt
const char* keyString = "qwertyuiopasdfgh";
const char* ivString = "0011223344556677";

RadioManager radioManager(address);
HmacManager hmacManager(key);
AesEncryptManager aesEncryptManager(keyString, ivString);
MessageManager messageManager;
TimeManager timeManager;



void setup() {
  Serial.begin(9600);
  Serial.flush();
  previousTime = millis();
  radioManager.radioInit();
}


const char* testMessage = "{\"1\":\"22.0\",\"2\":\"54.5\",\"3\":\"3.14\"}";

void loop() {
  unsigned long now = millis();

  if (now - previousTime >= 2000) {
    previousTime = now;
    char* timeStamp = timeManager.getTimestamp(now);
    handleDataAndSend(moduleId, testMessage, timeStamp);
  }

  delay(100);
}


void handleDataAndSend(char* moduleId, char* message, char* timeStamp){
  String payloadToEncrypt = messageManager.getMessageWithTimestamp(testMessage, timeStamp);
  String encryptedMessage = aesEncryptManager.encryptMessage(payloadToEncrypt);
  char* hash = hmacManager.calculateHash(encryptedMessage);
  String finalRadioMessage = messageManager.getFinalMessageForRadio(moduleId, encryptedMessage, hash);

  Serial.println(finalRadioMessage);

  SplitResult splitResult = messageManager.split(finalRadioMessage);
  radioManager.sendRadioMessage(splitResult.fragments, splitResult.numFragments);
  messageManager.freeMessageFragments(splitResult.fragments, splitResult.numFragments);
}

// // check RAM
// int freeRam () {
//   extern int __heap_start, *__brkval;
//   int v;
//   return (int) &v - (__brkval == 0 ? (int) &__heap_start : (int) __brkval);
// }
