import { Repository } from 'typeorm';
import ReadModuleDataDto from '../dto/read-module-data.dto';
import ReadingFieldType from '../../reading-types/types/reading-field.type';
import ReadingsEnrichedData from '../types/readings-enriched-data.type';
import { ReadingRepositoryListElement } from '../types/repository-list-element.type';
import ModuleReadingBase from '../entity/module-reading-base';
import ModulesService from '../../radio-modules/services/modules.service';

class ModuleReadingsPersistService<T extends ModuleReadingBase> {
  private readonly moduleService: ModulesService = new ModulesService();
  private readonly dataTypesRepositories: Map<ReadingFieldType, Repository<T>> =
    new Map();

  constructor(repositoriesList: ReadingRepositoryListElement<T>[]) {
    repositoriesList.forEach(
      (el: { readingFieldType: ReadingFieldType; repository: Repository<T> }) =>
        this.dataTypesRepositories.set(el.readingFieldType, el.repository),
    );
  }

  public async saveReadings(readModuleDataDto: ReadModuleDataDto) {
    const { moduleDbId, lastReadDate, data } = readModuleDataDto;
    for (const dataElement of data) {
      const { reading, type, readingTypeDbId }: ReadingsEnrichedData =
        dataElement;

      const repoForDataType: Repository<T> | undefined =
        this.dataTypesRepositories.get(type);
      if (!repoForDataType)
        throw new Error(
          `not repository fot data of type: ${type} supplied to RadioModuleReadingServide`,
        );
      await repoForDataType.save({
        reading,
        addedAt: new Date(),
        module: { id: moduleDbId },
        readingType: { id: readingTypeDbId },
      } as unknown as T);
    }
    await this.moduleService.updateModuleById(moduleDbId, {
      lastReadDate,
    });
  }
}

export default ModuleReadingsPersistService;
