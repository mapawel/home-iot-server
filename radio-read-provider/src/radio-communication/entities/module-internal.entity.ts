import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

class ModuleInternal {
  @IsString()
  @Length(1, 1)
  moduleId: string;

  @IsString()
  name: string;

  @IsNumber()
  pipeAddress: number;

  @IsString()
  @IsOptional()
  lastReadDate: Date;

  @IsString()
  @IsOptional()
  lastWriteDate: Date;

  @IsString()
  @IsOptional()
  addedAt: Date;

  @IsString()
  @IsOptional()
  updatedAt: Date;
}

export default ModuleInternal;
