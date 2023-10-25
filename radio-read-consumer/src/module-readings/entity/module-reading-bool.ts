import { Column, Entity } from 'typeorm';
import ModuleReadingBase from './module-reading-base';

@Entity()
class ModuleReadingBool extends ModuleReadingBase {
  @Column()
  reading: boolean;
}

export default ModuleReadingBool;
