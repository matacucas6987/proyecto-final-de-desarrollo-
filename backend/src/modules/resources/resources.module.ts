import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { GeneralBook } from './entities/general-book.entity';
import { ReserveBook } from './entities/reserve-book.entity';
import { ReferenceMaterial } from './entities/reference-material.entity';
import { Periodical } from './entities/periodical.entity';
import { MapItem } from './entities/map-item.entity';
import { TechDevice } from './entities/tech-device.entity';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resource,
      GeneralBook,
      ReserveBook,
      ReferenceMaterial,
      Periodical,
      MapItem,
      TechDevice,
    ]),
  ],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
