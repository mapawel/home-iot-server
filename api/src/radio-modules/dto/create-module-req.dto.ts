import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import ReadingType from '../../reading-types/entity/reading-type';

class CreateModuleReqDto {
  @IsString()
  moduleId: string;

  @IsString()
  name: string;

  @IsNumber()
  pipeAddress: number;

  @IsString()
  secretKey: string;

  @IsOptional()
  iv: string;

  @IsString()
  @IsOptional()
  lastReadDate: Date;

  @IsArray()
  readingTypes: Partial<ReadingType>[];
}

export default CreateModuleReqDto;
