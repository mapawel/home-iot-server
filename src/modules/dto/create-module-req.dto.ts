import { IsNumber, IsString } from 'class-validator';

class CreateModuleReqDto {
  @IsString()
  moduleId: string;

  @IsString()
  name: string;

  @IsNumber()
  pipeAddress: number;

  @IsString()
  secretKey: string;
}

export default CreateModuleReqDto;
