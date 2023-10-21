class Message {
  constructor(
    readonly moduleId: string,
    readonly encryptedData: string,
    readonly hash: string,
  ) {}
}

export default Message;
