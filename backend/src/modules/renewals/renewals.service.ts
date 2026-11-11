import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Renewal } from './entities/renewal.entity';
import { CreateRenewalDto } from './dto/create-renewal.dto';
import { Loan } from '../loans/entities/loan.entity';

@Injectable()
export class RenewalsService {
  constructor(
    @InjectRepository(Renewal)
    private readonly renewalRepository: Repository<Renewal>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async create(createRenewalDto: CreateRenewalDto): Promise<Renewal> {
    const loan = await this.loanRepository.findOne({
      where: { id: createRenewalDto.loanId },
    });

    if (!loan) {
      throw new NotFoundException(`Préstamo con ID ${createRenewalDto.loanId} no encontrado`);
    }

    const previousCount = await this.renewalRepository.count({
      where: { loanId: createRenewalDto.loanId },
    });

    const previousDueDate = loan.dueDate;
    const newDueDate = new Date(createRenewalDto.newDueDate);

    // Actualizar fecha de vencimiento en el préstamo base
    loan.dueDate = newDueDate;
    await this.loanRepository.save(loan);

    const renewal = this.renewalRepository.create({
      loanId: createRenewalDto.loanId,
      previousDueDate,
      newDueDate,
      renewalNumber: previousCount + 1,
    });

    return await this.renewalRepository.save(renewal);
  }

  async findAll(): Promise<Renewal[]> {
    return await this.renewalRepository.find({
      order: { renewalDate: 'DESC' },
    });
  }

  async findByLoan(loanId: string): Promise<Renewal[]> {
    return await this.renewalRepository.find({
      where: { loanId },
      order: { renewalDate: 'ASC' },
    });
  }
}
