#ifndef AES_ENCRYPT_MANAGER_H
#define AES_ENCRYPT_MANAGER_H

#include <Arduino.h>
#include <AESLib.h>

class AesEncryptManager {
public:
    AesEncryptManager(const char* inputKey, const char* inputIV);
    String encryptMessage(const String& payloadToEncrypt);

private:
    const String key;
    const String iv;
    byte keyByte[16];
    byte ivByte[16];

    String encryptAes(char* payload);
    void stringToByteArray(const String& input, byte* output);
};

#endif // AES_ENCRYPT_MANAGER_H