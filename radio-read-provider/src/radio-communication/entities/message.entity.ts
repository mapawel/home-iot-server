import { IsString, Length } from 'class-validator';

class Message {
  @IsString()
  @Length(1, 80)
  readonly moduleId: string;

  @IsString()
  @Length(1, 80)
  readonly encryptedData: string;

  @IsString()
  @Length(1, 80)
  readonly hash: string;
}

export default Message;
