import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Loan } from '../../loans/entities/loan.entity';

@Entity('renewals')
export class Renewal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Loan, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'loanId' })
  loan: Loan;

  @Column({ name: 'loanId' })
  loanId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  renewalDate: Date;

  @Column({ type: 'timestamp' })
  previousDueDate: Date;

  @Column({ type: 'timestamp' })
  newDueDate: Date;

  @Column({ type: 'int', default: 1 })
  renewalNumber: number; // Número correlativo de renovación

  @CreateDateColumn()
  createdAt: Date;
}
