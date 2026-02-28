import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSystemSettingsDto, UpdateUserPreferencesDto, BulkUpdateSettingsDto, BulkUpdateUserPreferencesDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // System Settings Endpoints
  @Get('system')
  async getAllSystemSettings() {
    return this.settingsService.getAllSystemSettings();
  }

  @Get('system/object')
  async getSystemSettingsAsObject() {
    return this.settingsService.getSystemSettingsAsObject();
  }

  @Get('system/:key')
  async getSystemSetting(@Param('key') key: string) {
    const value = await this.settingsService.getSystemSetting(key);
    return { key, value };
  }

  @Get('system/category/:category')
  async getSystemSettingsByCategory(@Param('category') category: string) {
    return this.settingsService.getSystemSettingsByCategory(category);
  }

  @Post('system')
  async setSystemSetting(@Body() dto: UpdateSystemSettingsDto) {
    const setting = await this.settingsService.setSystemSetting(
      dto.key,
      dto.value,
      dto.category,
      dto.description,
      dto.is_encrypted
    );
    return setting;
  }

  @Post('system/bulk')
  async bulkUpdateSystemSettings(@Body() dto: BulkUpdateSettingsDto) {
    return this.settingsService.bulkUpdateSystemSettings(dto);
  }

  @Patch('system/:key')
  async updateSystemSetting(@Param('key') key: string, @Body() dto: UpdateSystemSettingsDto) {
    const setting = await this.settingsService.setSystemSetting(
      key,
      dto.value,
      dto.category,
      dto.description,
      dto.is_encrypted
    );
    return setting;
  }

  @Delete('system/:key')
  async deleteSystemSetting(@Param('key') key: string) {
    const success = await this.settingsService.deleteSystemSetting(key);
    return { success };
  }

  // User Preferences Endpoints
  @Get('user/:userId')
  async getAllUserPreferences(@Param('userId') userId: string) {
    return this.settingsService.getAllUserPreferences(parseInt(userId));
  }

  @Get('user/:userId/object')
  async getUserPreferencesAsObject(@Param('userId') userId: string) {
    return this.settingsService.getUserPreferencesAsObject(parseInt(userId));
  }

  @Get('user/:userId/:key')
  async getUserPreference(@Param('userId') userId: string, @Param('key') key: string) {
    const value = await this.settingsService.getUserPreference(parseInt(userId), key);
    return { key, value };
  }

  @Get('user/:userId/category/:category')
  async getUserPreferencesByCategory(@Param('userId') userId: string, @Param('category') category: string) {
    return this.settingsService.getUserPreferencesByCategory(parseInt(userId), category);
  }

  @Post('user/:userId')
  async setUserPreference(@Param('userId') userId: string, @Body() dto: UpdateUserPreferencesDto) {
    const preference = await this.settingsService.setUserPreference(
      parseInt(userId),
      dto.key,
      dto.value,
      dto.category
    );
    return preference;
  }

  @Post('user/:userId/bulk')
  async bulkUpdateUserPreferences(@Param('userId') userId: string, @Body() dto: BulkUpdateUserPreferencesDto) {
    return this.settingsService.bulkUpdateUserPreferences(parseInt(userId), dto);
  }

  @Patch('user/:userId/:key')
  async updateUserPreference(@Param('userId') userId: string, @Param('key') key: string, @Body() dto: UpdateUserPreferencesDto) {
    const preference = await this.settingsService.setUserPreference(
      parseInt(userId),
      key,
      dto.value,
      dto.category
    );
    return preference;
  }

  @Delete('user/:userId/:key')
  async deleteUserPreference(@Param('userId') userId: string, @Param('key') key: string) {
    const success = await this.settingsService.deleteUserPreference(parseInt(userId), key);
    return { success };
  }

  // Initialization endpoint
  @Post('system/initialize')
  async initializeDefaultSettings() {
    await this.settingsService.initializeDefaultSettings();
    return { message: 'Paramètres système initialisés avec succès' };
  }
}
