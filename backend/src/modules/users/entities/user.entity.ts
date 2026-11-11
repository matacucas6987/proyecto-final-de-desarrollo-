import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  identification: string; // Documento de Identidad / Cédula

  @Column({ unique: true })
  code: string; // Código universitario

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ESTUDIANTE,
  })
  role: UserRole;

  @Column({ nullable: true })
  academicPlan: string; // Plan de estudio o departamento

  @Column({ type: 'int', nullable: true })
  semester: number; // Semestre actual

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ type: 'uuid', nullable: true })
  createdById?: string;

  @ManyToOne(() => User, (user) => user.createdUsers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'createdById' })
  createdBy?: User;

  @OneToMany(() => User, (user) => user.createdBy)
  createdUsers?: User[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
