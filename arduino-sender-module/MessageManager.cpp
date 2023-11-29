#include "MessageManager.h"

const char* MessageManager::startMark = ">";
const char* MessageManager::endMark = "<";
const char* MessageManager::separateMark = "|";

MessageManager::MessageManager() {
}

SplitResult MessageManager::split(const String& longText) {
  const size_t maxFragmentSize = 32;
  size_t textLength = longText.length();
  size_t messageFragmentsNum = (textLength + maxFragmentSize - 1) / maxFragmentSize;

  char** fragments = new char*[messageFragmentsNum];

  const char* textPtr = longText.c_str();

  for (size_t i = 0; i < messageFragmentsNum; ++i) {
    size_t fragmentSize = min(maxFragmentSize, textLength);
    fragments[i] = new char[fragmentSize + 1];
    strncpy(fragments[i], textPtr, fragmentSize);
    fragments[i][fragmentSize] = '\0';
    textPtr += fragmentSize;
    textLength -= fragmentSize;
  }

  return {fragments, messageFragmentsNum};
}

void MessageManager::freeMessageFragments(char** fragments, size_t numFragments) {
    for (size_t i = 0; i < numFragments; ++i) {
        delete[] fragments[i];
    }
    delete[] fragments;
}

String MessageManager::getMessageWithTimestamp(char* message, char* timeStamp) {
  return String(message) + separateMark + String(timeStamp);
}

String MessageManager::getFinalMessageForRadio(char* moduleId, String encryptedMessage, char* hash) {
    return String(startMark) + moduleId + String(separateMark) + encryptedMessage + String(separateMark) + hash + String(endMark);
}
