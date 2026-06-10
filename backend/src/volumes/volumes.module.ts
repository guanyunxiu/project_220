import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolumesService } from './volumes.service';
import { VolumesController } from './volumes.controller';
import { Volume } from '../entities/volume.entity';
import { Work } from '../entities/work.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Volume, Work])],
  controllers: [VolumesController],
  providers: [VolumesService],
  exports: [VolumesService],
})
export class VolumesModule {}
