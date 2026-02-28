import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSettings } from './entities/settings.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { UpdateSystemSettingsDto, UpdateUserPreferencesDto, BulkUpdateSettingsDto, BulkUpdateUserPreferencesDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SystemSettings)
    private readonly systemSettingsRepository: Repository<SystemSettings>,
    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepository: Repository<UserPreferences>,
  ) {}

  // System Settings Methods
  async getSystemSetting(key: string): Promise<string | null> {
    const setting = await this.systemSettingsRepository.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async setSystemSetting(key: string, value: string, category?: string, description?: string, isEncrypted = false): Promise<SystemSettings> {
    let setting = await this.systemSettingsRepository.findOne({ where: { key } });
    
    if (setting) {
      setting.value = value;
      if (category) setting.category = category;
      if (description) setting.description = description;
      setting.is_encrypted = isEncrypted;
      return this.systemSettingsRepository.save(setting);
    } else {
      setting = this.systemSettingsRepository.create({
        key,
        value,
        category,
        description,
        is_encrypted: isEncrypted,
      });
      return this.systemSettingsRepository.save(setting);
    }
  }

  async getSystemSettingsByCategory(category: string): Promise<SystemSettings[]> {
    return this.systemSettingsRepository.find({ where: { category } });
  }

  async getAllSystemSettings(): Promise<SystemSettings[]> {
    return this.systemSettingsRepository.find();
  }

  async bulkUpdateSystemSettings(bulkDto: BulkUpdateSettingsDto): Promise<SystemSettings[]> {
    const results = [];
    for (const settingDto of bulkDto.settings) {
      const setting = await this.setSystemSetting(
        settingDto.key,
        settingDto.value,
        settingDto.category,
        settingDto.description,
        settingDto.is_encrypted
      );
      results.push(setting);
    }
    return results;
  }

  async deleteSystemSetting(key: string): Promise<boolean> {
    const result = await this.systemSettingsRepository.delete({ key });
    return result.affected > 0;
  }

  // User Preferences Methods
  async getUserPreference(userId: number, key: string): Promise<string | null> {
    const preference = await this.userPreferencesRepository.findOne({ 
      where: { user_id: userId, key } 
    });
    return preference ? preference.value : null;
  }

  async setUserPreference(userId: number, key: string, value: string, category?: string): Promise<UserPreferences> {
    let preference = await this.userPreferencesRepository.findOne({ 
      where: { user_id: userId, key } 
    });
    
    if (preference) {
      preference.value = value;
      if (category) preference.category = category;
      return this.userPreferencesRepository.save(preference);
    } else {
      preference = this.userPreferencesRepository.create({
        user_id: userId,
        key,
        value,
        category,
      });
      return this.userPreferencesRepository.save(preference);
    }
  }

  async getUserPreferencesByCategory(userId: number, category: string): Promise<UserPreferences[]> {
    return this.userPreferencesRepository.find({ 
      where: { user_id: userId, category } 
    });
  }

  async getAllUserPreferences(userId: number): Promise<UserPreferences[]> {
    return this.userPreferencesRepository.find({ 
      where: { user_id: userId } 
    });
  }

  async bulkUpdateUserPreferences(userId: number, bulkDto: BulkUpdateUserPreferencesDto): Promise<UserPreferences[]> {
    const results = [];
    for (const prefDto of bulkDto.preferences) {
      const preference = await this.setUserPreference(
        userId,
        prefDto.key,
        prefDto.value,
        prefDto.category
      );
      results.push(preference);
    }
    return results;
  }

  async deleteUserPreference(userId: number, key: string): Promise<boolean> {
    const result = await this.userPreferencesRepository.delete({ 
      user_id: userId, 
      key 
    });
    return result.affected > 0;
  }

  // Helper methods for common settings
  async getSystemSettingsAsObject(): Promise<Record<string, any>> {
    const settings = await this.getAllSystemSettings();
    const result: Record<string, any> = {};
    
    for (const setting of settings) {
      try {
        result[setting.key] = JSON.parse(setting.value);
      } catch {
        result[setting.key] = setting.value;
      }
    }
    
    return result;
  }

  async getUserPreferencesAsObject(userId: number): Promise<Record<string, any>> {
    const preferences = await this.getAllUserPreferences(userId);
    const result: Record<string, any> = {};
    
    for (const preference of preferences) {
      try {
        result[preference.key] = JSON.parse(preference.value);
      } catch {
        result[preference.key] = preference.value;
      }
    }
    
    return result;
  }

  // Initialize default system settings
  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      {
        key: 'site.name',
        value: 'Chrono-Carto',
        category: 'general',
        description: 'Nom du site'
      },
      {
        key: 'site.description',
        value: 'Plateforme pédagogique pour l\'Histoire-Géographie',
        category: 'general',
        description: 'Description du site'
      },
      {
        key: 'site.url',
        value: 'https://chronocarto.fr',
        category: 'general',
        description: 'URL du site'
      },
      {
        key: 'site.admin_email',
        value: 'admin@chronocarto.fr',
        category: 'general',
        description: 'Email administrateur'
      },
      {
        key: 'site.timezone',
        value: 'Europe/Paris',
        category: 'general',
        description: 'Fuseau horaire'
      },
      {
        key: 'site.language',
        value: 'fr',
        category: 'general',
        description: 'Langue par défaut'
      },
      {
        key: 'security.enable_two_factor',
        value: 'true',
        category: 'security',
        description: 'Activer l\'authentification à deux facteurs'
      },
      {
        key: 'security.session_timeout',
        value: '30',
        category: 'security',
        description: 'Délai d\'expiration de session (minutes)'
      },
      {
        key: 'security.max_login_attempts',
        value: '5',
        category: 'security',
        description: 'Nombre maximum de tentatives de connexion'
      },
      {
        key: 'security.password_min_length',
        value: '8',
        category: 'security',
        description: 'Longueur minimale du mot de passe'
      },
      {
        key: 'notifications.email',
        value: 'true',
        category: 'notifications',
        description: 'Activer les notifications par email'
      },
      {
        key: 'notifications.sms',
        value: 'false',
        category: 'notifications',
        description: 'Activer les notifications par SMS'
      },
      {
        key: 'notifications.push',
        value: 'true',
        category: 'notifications',
        description: 'Activer les notifications push'
      },
      {
        key: 'appearance.theme',
        value: 'dark',
        category: 'appearance',
        description: 'Thème par défaut'
      },
      {
        key: 'appearance.primary_color',
        value: '#3B82F6',
        category: 'appearance',
        description: 'Couleur primaire'
      },
      {
        key: 'storage.max_file_size',
        value: '100',
        category: 'storage',
        description: 'Taille maximale des fichiers (MB)'
      },
      {
        key: 'storage.allowed_file_types',
        value: JSON.stringify(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'avi', 'mov']),
        category: 'storage',
        description: 'Types de fichiers autorisés'
      }
    ];

    for (const setting of defaultSettings) {
      await this.setSystemSetting(
        setting.key,
        setting.value,
        setting.category,
        setting.description
      );
    }
  }
}
