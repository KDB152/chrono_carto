"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
exports.databaseConfig = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'samih_jeridi',
    password: process.env.DB_PASSWORD || 'samih123@',
    database: process.env.DB_NAME || 'chrono_carto',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // Set to true only in development
    logging: true,
};
