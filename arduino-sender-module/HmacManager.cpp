#include "HmacManager.h"

Sha256 sha;

HmacManager::HmacManager(const char* inputKey) : key(inputKey) {
    mapStringKeyToUint();
}

void HmacManager::mapStringKeyToUint() {
    for (int i = 0; i < 16; i++) {
        hmacKey[i] = (uint8_t)key[i];
    }
}

char* HmacManager::mapUintHashToString(uint8_t* uint8t) {
    static char buffer[65]; // 32 bajty * 2 znaki na bajt + 1 dla znaku kończącego
    char* ptr = buffer;

    for (int i = 0; i < 32; i++) {
        *ptr++ = "0123456789abcdef"[uint8t[i] >> 4];
        *ptr++ = "0123456789abcdef"[uint8t[i] & 0xf];
    }
    *ptr = '\0'; // Dodanie znaku kończącego

    return buffer;
}

char* HmacManager::calculateHash(const String& encryptedMessage) {
    sha.initHmac(hmacKey, 16);
    sha.print(encryptedMessage);
    return mapUintHashToString(sha.resultHmac());
}