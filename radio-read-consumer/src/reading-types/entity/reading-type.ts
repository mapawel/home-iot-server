import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import ReadingFieldType from '../types/reading-field.type';
import ModuleReadingBase from '../../module-readings/entity/module-reading-base';

@Entity()
class ReadingType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  name: string;

  @Column()
  type: ReadingFieldType;

  @OneToMany(() => ModuleReadingBase, (reading) => reading.module)
  readings: ModuleReadingBase[];
}

export default ReadingType;
