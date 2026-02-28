import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pdp } from './entities/pdp.entity';
import { User } from '../users/entities/user.entity';
import { PdpController } from './pdp.controller';
import { PdpService } from './pdp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pdp, User])
  ],
  controllers: [PdpController],
  providers: [PdpService],
  exports: [PdpService]
})
export class PdpModule {}
