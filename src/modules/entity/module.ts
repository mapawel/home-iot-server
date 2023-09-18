import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import ReadingType from '../../reading-types/entity/reading-type';

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
}

export default Module;
