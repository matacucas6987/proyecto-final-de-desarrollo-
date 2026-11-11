import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Resource } from './resource.entity';

@Entity('collection_general_books')
export class GeneralBook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Resource, (res) => res.generalBook, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resourceId' })
  resource: Resource;

  @Column({ name: 'resourceId' })
  resourceId: string;

  @Column({ nullable: true })
  isbn: string;

  @Column()
  author: string;

  @Column({ nullable: true })
  publisher: string;

  @Column({ type: 'int', nullable: true })
  publicationYear: number;

  @Column({ nullable: true })
  edition: string;

  @Column({ type: 'int', nullable: true })
  pages: number;
}
