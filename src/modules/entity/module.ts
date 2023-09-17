import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  fkToBind: string;

  @Column({ nullable: true })
  lastReadDate: Date;

  @Column({ nullable: true })
  lastWriteDate: Date;

  @Column()
  addedAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}

export default Module;
