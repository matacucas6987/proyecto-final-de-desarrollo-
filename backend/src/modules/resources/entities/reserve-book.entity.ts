import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Resource } from './resource.entity';

@Entity('collection_reserve_books')
export class ReserveBook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Resource, (res) => res.reserveBook, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;

  @Column({ name: 'resourceId' })
  resourceId: string;

  @Column()
  courseCode: string; // Código del curso académico

  @Column()
  courseName: string;

  @Column()
  professorName: string;

  @Column()
  academicDepartment: string;

  @Column({ nullable: true })
  semester: string;

  @Column({ type: 'int', default: 2 })
  maxLoanHours: number; // Por lo general préstamo por horas en sala
}
