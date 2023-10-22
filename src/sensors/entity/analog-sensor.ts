import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AnalogSensor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  addedTime: Date;
}
