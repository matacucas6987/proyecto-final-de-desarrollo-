import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Resource } from './resource.entity';

@Entity('collection_periodicals')
export class Periodical {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Resource, (res) => res.periodical, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;

  @Column({ name: 'resourceId' })
  resourceId: string;

  @Column({ nullable: true })
  issn: string;

  @Column({ nullable: true })
  issueNumber: string; // Número de edición o fascículo

  @Column({ nullable: true })
  volume: string;

  @Column({ type: 'date', nullable: true })
  publicationDate: string;

  @Column({ nullable: true })
  periodicity: string; // Mensual, Trimestral, Semestral
}
