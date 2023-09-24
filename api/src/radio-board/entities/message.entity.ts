class Message {
  constructor(
    readonly fastId: string,
    readonly moduleId: string,
    readonly encryptedData: string,
  ) {}
}

export default Message;
