import { IsString, Length } from 'class-validator';

class Message {
  @IsString()
  @Length(10, 12)
  readonly moduleId: string;

  @IsString()
  @Length(40, 300)
  readonly encryptedData: string;

  @IsString()
  @Length(64, 64)
  readonly hash: string;
}

export default Message;
