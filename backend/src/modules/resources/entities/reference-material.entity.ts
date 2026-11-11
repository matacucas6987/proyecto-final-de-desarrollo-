import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Resource } from './resource.entity';

@Entity('collection_reference_materials')
export class ReferenceMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Resource, (res) => res.referenceMaterial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;

  @Column({ name: 'resourceId' })
  resourceId: string;

  @Column({ nullable: true })
  volumeNumber: string;

  @Column()
  subjectArea: string; // Área temática (p. ej. Medicina, Derecho, Lingüística)

  @Column({ nullable: true })
  publisher: string;

  @Column({ default: true })
  consultationOnly: boolean; // Material exclusivo para consulta en sala
}
