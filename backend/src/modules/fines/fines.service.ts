import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fine } from './entities/fine.entity';
import { CreateFineDto } from './dto/create-fine.dto';
import { FineStatus } from './enums/fine-status.enum';

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(Fine)
    private readonly fineRepository: Repository<Fine>,
  ) {}

  async create(createFineDto: CreateFineDto): Promise<Fine> {
    const fine = this.fineRepository.create({
      userId: createFineDto.userId,
      loanId: createFineDto.loanId,
      daysOverdue: createFineDto.daysOverdue || 0,
      amount: createFineDto.amount,
      status: createFineDto.status || FineStatus.PENDIENTE,
      reason: createFineDto.reason,
    });
    return await this.fineRepository.save(fine);
  }

  async findAll(status?: FineStatus): Promise<Fine[]> {
    if (status) {
      return await this.fineRepository.find({
        where: { status },
        order: { createdAt: 'DESC' },
      });
    }
    return await this.fineRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Fine> {
    const fine = await this.fineRepository.findOne({ where: { id } });
    if (!fine) {
      throw new NotFoundException(`Multa con ID ${id} no encontrada`);
    }
    return fine;
  }

  async findByUser(userId: string): Promise<Fine[]> {
    return await this.fineRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async payFine(id: string): Promise<Fine> {
    const fine = await this.findOne(id);
    fine.status = FineStatus.PAGADA;
    fine.paidAt = new Date();
    return await this.fineRepository.save(fine);
  }

  async waiveFine(id: string): Promise<Fine> {
    const fine = await this.findOne(id);
    fine.status = FineStatus.CONDONADA;
    return await this.fineRepository.save(fine);
  }
}
