import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Module from '../../modules/entity/module';
import ReadingType from '../../reading-types/entity/reading-type';

@Entity()
abstract class ModuleReadingBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  addedAt: Date;

  @ManyToOne(() => Module, (module) => module.readings)
  @JoinTable()
  module: Module;

  @ManyToOne(() => ReadingType, (readingType) => readingType.readings)
  @JoinColumn()
  readingType: ReadingType;
}

export default ModuleReadingBase;
