import { IsNumber, IsOptional, IsString } from 'class-validator';

class CreateModuleReqDto {
  @IsString()
  moduleId: string;

  @IsString()
  name: string;

  @IsNumber()
  pipeAddress: number;

  @IsString()
  secretKey: string;

  @IsString()
  @IsOptional()
  lastReadDate: Date;
}

export default CreateModuleReqDto;
