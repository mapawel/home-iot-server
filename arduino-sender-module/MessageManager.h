#ifndef MESSAGE_MANAGER_H
#define MESSAGE_MANAGER_H

#include <Arduino.h>

struct SplitResult {
    char** fragments;
    size_t numFragments;
};

class MessageManager {
public:
  MessageManager();
  SplitResult split(const String& longText);
  void freeMessageFragments(char** fragments, size_t numFragments);
  String getMessageWithTimestamp(char* message, char* timeStamp);
  String getFinalMessageForRadio(char* moduleId, String encryptedMessage, char* hash);

private:
  static const char* startMark;
  static const char* endMark;
  static const char* separateMark;
};

#endif // MESSAGE_MANAGER_H
