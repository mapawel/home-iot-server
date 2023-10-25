import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import ReadingType from '../../reading-types/entity/reading-type';
import ModuleReadingBase from '../../module-readings/entity/module-reading-base';

@Entity()
class Module {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  moduleId: string;

  @Column()
  name: string;

  @Column()
  pipeAddress: number;

  @Column()
  secretKey: string;

  @Column({ nullable: true })
  fkToBind: string;

  @Column({ nullable: true })
  lastReadDate: Date;

  @Column({ nullable: true })
  lastWriteDate: Date;

  @Column()
  addedAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;

  @ManyToMany(() => ReadingType)
  @JoinTable()
  readingTypes: ReadingType[];

  @OneToMany(() => ModuleReadingBase, (reading) => reading.module)
  readings: ModuleReadingBase[];
}

export default Module;
