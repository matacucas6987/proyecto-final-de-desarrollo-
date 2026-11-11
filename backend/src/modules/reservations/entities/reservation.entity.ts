import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReservationStatus } from '../enums/reservation-status.enum';
import { User } from '../../users/entities/user.entity';
import { Resource } from '../../resources/entities/resource.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => Resource, { eager: true, onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'resourceId' })
  resource?: Resource;

  @Column({ name: 'resourceId', nullable: true })
  resourceId?: string;

  @Column({ default: 'GENERAL' })
  category: string; // 'GENERAL' o 'TABLETA' / 'LAPTOP' para cola de Tecnoteca

  @Column({ type: 'int', default: 1 })
  queuePosition: number; // Posición en la cola de espera

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDIENTE,
  })
  status: ReservationStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reservationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
