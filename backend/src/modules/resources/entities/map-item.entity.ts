import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Resource } from './resource.entity';

@Entity('collection_map_items')
export class MapItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Resource, (res) => res.mapItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;

  @Column({ name: 'resourceId' })
  resourceId: string;

  @Column()
  scale: string; // Escala (p. ej. 1:50000)

  @Column()
  geographicArea: string; // Región geográfica o país

  @Column({ nullable: true })
  projectionType: string; // Proyección cartográfica (p. ej. Mercator)

  @Column({ nullable: true })
  cartographer: string;

  @Column({ nullable: true })
  dimensions: string; // Dimensiones físicas
}
