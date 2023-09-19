import { Column, Entity } from 'typeorm';
import ModuleReadingBase from './module-reading-base';

@Entity()
class ModuleReadingNumber extends ModuleReadingBase {
  @Column()
  reading: number;
}

export default ModuleReadingNumber;
