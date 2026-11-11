import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Resource } from './resource.entity';

export enum TechDeviceType {
  LAPTOP = 'LAPTOP',
  TABLET = 'TABLET',
}

@Entity('collection_tech_devices')
export class TechDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Resource, (res) => res.techDevice, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;

  @Column({ name: 'resourceId' })
  resourceId: string;

  @Column({
    type: 'enum',
    enum: TechDeviceType,
  })
  deviceType: TechDeviceType;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ unique: true })
  serialNumber: string;

  @Column({ default: true })
  hasCharger: boolean;

  @Column({ default: false })
  hasStylus: boolean;

  @Column({ nullable: true })
  specifications: string; // RAM, almacenamiento, procesador
}
