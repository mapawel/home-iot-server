import ReadModuleDataDto from '../dto/read-module-data.dto';
import { ReadModuleDataHandlerInterface } from '../service/read-module-data-handler.interface';
import ModuleReadingsPersistService from '../service/module-readings-persist.service';
import ModuleReadingBase from '../entity/module-reading-base';
import ReadingTypeField from '../../reading-types/types/reading-field.type';
import mySQLDataSource from '../../data-sources/sql/mySQL.data-source';
import ModuleReadingNumber from '../entity/module-reading-number';
import ModuleReadingBool from '../entity/module-reading-bool';

export class ReadModuleDataHandler implements ReadModuleDataHandlerInterface {
  private readonly moduleReadingsPersistService =
    new ModuleReadingsPersistService<ModuleReadingBase>([
      {
        readingFieldType: ReadingTypeField.NUMBER,
        repository: mySQLDataSource.getRepository(ModuleReadingNumber),
      },
      {
        readingFieldType: ReadingTypeField.BOOLEAN,
        repository: mySQLDataSource.getRepository(ModuleReadingBool),
      },
    ]);

  public async proceedReadModuleDataDto(
    readModuleDataDto: ReadModuleDataDto,
  ): Promise<void> {
    try {
      console.log('GO!', readModuleDataDto);
      await this.moduleReadingsPersistService.saveReadings(readModuleDataDto);
    } catch (err) {
      throw err;
    }
  }
}
