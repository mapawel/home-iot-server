import { Column, Entity } from 'typeorm';
import ModuleReadingBase from './module-reading-base';

@Entity()
class ModuleReadingNumber extends ModuleReadingBase {
  @Column('decimal', { precision: 4, scale: 2 })
  reading: number;
}

export default ModuleReadingNumber;
