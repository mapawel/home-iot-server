import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import ReadingFieldType from '../types/reading-field.type';

@Entity()
class ReadingType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: ReadingFieldType;
}

export default ReadingType;
