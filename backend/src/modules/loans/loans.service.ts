import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './entities/loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanStatus } from './enums/loan-status.enum';
import { Resource } from '../resources/entities/resource.entity';
import { ResourceStatus } from '../resources/enums/resource-status.enum';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    const loan = this.loanRepository.create({
      userId: createLoanDto.userId,
      resourceId: createLoanDto.resourceId,
      dueDate: new Date(createLoanDto.dueDate),
      notes: createLoanDto.notes,
      status: LoanStatus.ACTIVO,
    });
    const savedLoan = await this.loanRepository.save(loan);

    // Marcar recurso como Prestado
    const resource = await this.resourceRepository.findOne({ where: { id: createLoanDto.resourceId } });
    if (resource) {
      resource.status = ResourceStatus.PRESTADO;
      await this.resourceRepository.save(resource);
    }

    return savedLoan;
  }

  async findAll(status?: LoanStatus): Promise<Loan[]> {
    if (status) {
      return await this.loanRepository.find({
        where: { status },
        order: { loanDate: 'DESC' },
      });
    }
    return await this.loanRepository.find({
      order: { loanDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({ where: { id } });
    if (!loan) {
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
    }
    return loan;
  }

  async findByUser(userId: string): Promise<Loan[]> {
    return await this.loanRepository.find({
      where: { userId },
      order: { loanDate: 'DESC' },
    });
  }

  async returnResource(id: string): Promise<Loan> {
    const loan = await this.findOne(id);
    loan.status = LoanStatus.DEVUELTO;
    loan.returnDate = new Date();
    const updatedLoan = await this.loanRepository.save(loan);

    // Liberar recurso a Disponible
    const resource = await this.resourceRepository.findOne({ where: { id: loan.resourceId } });
    if (resource) {
      resource.status = ResourceStatus.DISPONIBLE;
      await this.resourceRepository.save(resource);
    }

    return updatedLoan;
  }
}
