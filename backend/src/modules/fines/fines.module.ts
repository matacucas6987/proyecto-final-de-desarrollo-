import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fine } from './entities/fine.entity';
import { FinesService } from './fines.service';
import { FinesController } from './fines.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Fine])],
  controllers: [FinesController],
  providers: [FinesService],
  exports: [FinesService],
})
export class FinesModule {}
