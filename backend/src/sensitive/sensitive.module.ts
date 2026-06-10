import { Module, Global } from '@nestjs/common';
import { SensitiveService } from './sensitive.service';
import { SensitiveController } from './sensitive.controller';

@Global()
@Module({
  controllers: [SensitiveController],
  providers: [SensitiveService],
  exports: [SensitiveService],
})
export class SensitiveModule {}
