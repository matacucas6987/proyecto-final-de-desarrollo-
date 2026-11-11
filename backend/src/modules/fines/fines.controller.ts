import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FinesService } from './fines.service';
import { CreateFineDto } from './dto/create-fine.dto';
import { FineStatus } from './enums/fine-status.enum';

@Controller('fines')
export class FinesController {
  constructor(private readonly finesService: FinesService) {}

  @Post()
  create(@Body() createFineDto: CreateFineDto) {
    return this.finesService.create(createFineDto);
  }

  @Get()
  findAll(@Query('status') status?: FineStatus) {
    return this.finesService.findAll(status);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.finesService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.finesService.findOne(id);
  }

  @Patch(':id/pay')
  payFine(@Param('id', ParseUUIDPipe) id: string) {
    return this.finesService.payFine(id);
  }

  @Patch(':id/waive')
  waiveFine(@Param('id', ParseUUIDPipe) id: string) {
    return this.finesService.waiveFine(id);
  }
}
