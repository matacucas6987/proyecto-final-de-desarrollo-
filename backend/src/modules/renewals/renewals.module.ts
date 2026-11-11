import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Renewal } from './entities/renewal.entity';
import { Loan } from '../loans/entities/loan.entity';
import { RenewalsService } from './renewals.service';
import { RenewalsController } from './renewals.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Renewal, Loan])],
  controllers: [RenewalsController],
  providers: [RenewalsService],
  exports: [RenewalsService],
})
export class RenewalsModule {}
