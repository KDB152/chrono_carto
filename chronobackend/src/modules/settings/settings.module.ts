import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SystemSettings } from './entities/settings.entity';
import { UserPreferences } from './entities/user-preferences.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemSettings, UserPreferences]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
