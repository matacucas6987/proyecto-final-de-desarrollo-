import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { ResourceStatus } from '../enums/resource-status.enum';
import { CollectionType } from '../enums/collection-type.enum';
import { GeneralBook } from './general-book.entity';
import { ReserveBook } from './reserve-book.entity';
import { ReferenceMaterial } from './reference-material.entity';
import { Periodical } from './periodical.entity';
import { MapItem } from './map-item.entity';
import { TechDevice } from './tech-device.entity';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  code: string; // Signatura topográfica o código de barras

  @Column({
    type: 'enum',
    enum: CollectionType,
  })
  collection: CollectionType;

  @Column({
    type: 'enum',
    enum: ResourceStatus,
    default: ResourceStatus.DISPONIBLE,
  })
  status: ResourceStatus;

  @Column({ nullable: true })
  location: string; // Ubicación física (p. ej. Estante A-4, Vitrina 2, Sala Tecnoteca)

  @Column({ type: 'date', nullable: true })
  acquisitionDate: string;

  @OneToOne(() => GeneralBook, (book) => book.resource, { cascade: true, nullable: true })
  generalBook?: GeneralBook;

  @OneToOne(() => ReserveBook, (book) => book.resource, { cascade: true, nullable: true })
  reserveBook?: ReserveBook;

  @OneToOne(() => ReferenceMaterial, (ref) => ref.resource, { cascade: true, nullable: true })
  referenceMaterial?: ReferenceMaterial;

  @OneToOne(() => Periodical, (item) => item.resource, { cascade: true, nullable: true })
  periodical?: Periodical;

  @OneToOne(() => MapItem, (map) => map.resource, { cascade: true, nullable: true })
  mapItem?: MapItem;

  @OneToOne(() => TechDevice, (device) => device.resource, { cascade: true, nullable: true })
  techDevice?: TechDevice;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
