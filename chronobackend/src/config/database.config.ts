// src/config/database.config.ts
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities:
    process.env.NODE_ENV === 'production'
      ? ['dist/modules/**/entities/*.js']
      : ['src/modules/**/entities/*.ts'],
  migrations:
    process.env.NODE_ENV === 'production'
      ? ['dist/migrations/*.js']
      : ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
  dropSchema: false,
  migrationsRun: true,
};

// Named export for CommonJS compatibility
export const AppDataSource = new DataSource(databaseConfig);
