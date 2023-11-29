#include "AesEncryptManager.h"

AESLib aesLib;

AesEncryptManager::AesEncryptManager(const char* inputKey, const char* inputIV) 
    : key(inputKey), iv(inputIV) {}

String AesEncryptManager::encryptAes(char * payload) {
    aesLib.set_paddingmode(paddingMode::CMS);
    stringToByteArray(key, keyByte);
    stringToByteArray(iv, ivByte);

    int payloadLen = strlen(payload);
    char encrypted[2 * payloadLen] = {0};
    aesLib.encrypt64(payload, payloadLen, encrypted, keyByte, 16, ivByte);
    return String(encrypted);
}

void AesEncryptManager::stringToByteArray(const String& input, byte* output) {
    for (int i = 0; i < input.length(); ++i) {
        output[i] = (byte)input[i];
    }
}

String AesEncryptManager::encryptMessage(const String& payloadToEncrypt) {
    const char* cstrPayloadToEncrypt = payloadToEncrypt.c_str();
    return encryptAes(cstrPayloadToEncrypt);
}