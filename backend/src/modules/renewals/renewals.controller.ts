import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RenewalsService } from './renewals.service';
import { CreateRenewalDto } from './dto/create-renewal.dto';

@Controller('renewals')
export class RenewalsController {
  constructor(private readonly renewalsService: RenewalsService) {}

  @Post()
  create(@Body() createRenewalDto: CreateRenewalDto) {
    return this.renewalsService.create(createRenewalDto);
  }

  @Get()
  findAll() {
    return this.renewalsService.findAll();
  }

  @Get('loan/:loanId')
  findByLoan(@Param('loanId', ParseUUIDPipe) loanId: string) {
    return this.renewalsService.findByLoan(loanId);
  }
}
