import ReadModuleDataDto from '../dto/read-module-data.dto';

export interface ReadModuleDataHandlerInterface {
  proceedReadModuleDataDto(readModuleDataDto: ReadModuleDataDto): void;
}
