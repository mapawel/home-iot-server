interface ModuleInternalDto {
  moduleId: string;
  name: string;
  pipeAddress: number;
  lastReadDate: Date;
  lastWriteDate: Date;
  addedAt: Date;
  updatedAt: Date;
}

export default ModuleInternalDto;
