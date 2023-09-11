import Message from '../entities/message.entity';

class ReadingBuilder {
  private textMessageFragments: string[] = [];
  private readTextMessage: string = '';
  private parsedMessage: Message | null = null;
  private readonly startMark = '>';
  private readonly finishMark = '<';
  private isMsgStarted: boolean;

  public mergeReadMessageFragments(messageFragment: string): Message | null {
    if (messageFragment.includes(this.startMark)) {
      this.clearReadings();
      this.addFragment(messageFragment);
      return null;
    }
    if (messageFragment.includes(this.finishMark)) {
      this.addFragment(messageFragment);
      this.joinFragments();
      return this.parsedMessage;
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
