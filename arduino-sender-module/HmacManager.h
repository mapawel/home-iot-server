#ifndef HMAC_MANAGER_H
#define HMAC_MANAGER_H

#include <Arduino.h>
#include "sha256.h"

class HmacManager {
public:
    HmacManager(const char* inputKey);
    char* calculateHash(const String& encryptedMessage);

private:
    const char* key;
    uint8_t hmacKey[16];

    void mapStringKeyToUint();
    char* mapUintHashToString(uint8_t* uint8t);
};

#endif // HMAC_MANAGER_H