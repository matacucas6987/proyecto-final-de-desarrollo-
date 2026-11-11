import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FineStatus } from '../enums/fine-status.enum';
import { User } from '../../users/entities/user.entity';
import { Loan } from '../../loans/entities/loan.entity';

@Entity('fines')
export class Fine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => Loan, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'loanId' })
  loan?: Loan;

  @Column({ name: 'loanId', nullable: true })
  loanId?: string;

  @Column({ type: 'int', default: 0 })
  daysOverdue: number; // Días de retraso

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0 })
  amount: number; // Monto de la multa

  @Column({
    type: 'enum',
    enum: FineStatus,
    default: FineStatus.PENDIENTE,
  })
  status: FineStatus;

  @Column({ nullable: true })
  reason: string; // Motivo de la multa

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
