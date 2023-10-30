import ReadingFieldType from '../../reading-types/types/reading-field.type';
import { Repository } from 'typeorm';
import ModuleReadingBase from '../entity/module-reading-base';

export interface ReadingRepositoryListElement<T extends ModuleReadingBase> {
  readingFieldType: ReadingFieldType;
  repository: Repository<T>;
}
