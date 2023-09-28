import Message from '../entities/message.entity';

class ReadingBuilder {
  private textMessageFragments: string[] = [];
  private readTextMessage: string = '';
  private parsedMessage: Message | null = null;
  private readonly startMark = '>';
  private readonly finishMark = '<';
  private isMsgStarted: boolean;

  public getFinalMergedMessage(
    textMessageFragment: string,
    callback: (message: Message) => void,
  ): void {
    const message: Message | null =
      this.mergeReadMessageFragments(textMessageFragment);
    if (!message) return;
    callback(message);
  }

  private mergeReadMessageFragments(messageFragment: string): Message | null {
    const fragmentLength: number = messageFragment.length;
    const indexOfStartMark: number = messageFragment.indexOf(this.startMark);
    const indexOfFinishMark: number = messageFragment.indexOf(this.finishMark);

    if (messageFragment.includes(this.startMark)) {
      this.clearReadings();
      this.addFragment(messageFragment.slice(indexOfStartMark + 1));
      this.isMsgStarted = true;
      return null;
    }
    if (messageFragment.includes(this.finishMark)) {
      if (!this.isMsgStarted) {
        this.clearReadings();
        return null;
      }
      this.addFragment(
        messageFragment.slice(0, indexOfFinishMark - fragmentLength),
      );
      this.joinFragments();
      this.parseTextMessage();
      return this.parsedMessage;
    }

    if (!this.isMsgStarted) {
      this.clearReadings();
      return null;
    }
    this.addFragment(messageFragment);
    return null;
  }

  private clearReadings() {
    this.textMessageFragments.length = 0;
    this.readTextMessage = '';
  }

  private joinFragments() {
    this.readTextMessage = this.textMessageFragments.join();
  }

  // todo ADD VALIDATION HERE! ! !
  private parseTextMessage() {
    const textMessageBlocks: string[] = this.readTextMessage.split('|');
    this.parsedMessage = new Message(
      textMessageBlocks[0],
      textMessageBlocks[1],
      textMessageBlocks[2],
    );
  }

  private addFragment(messageFragment: string) {
    this.textMessageFragments.push(messageFragment);
  }
}

export default ReadingBuilder;
