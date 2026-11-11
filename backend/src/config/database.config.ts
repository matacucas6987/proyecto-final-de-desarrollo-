import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  autoLoadEntities: true,
  synchronize: true, // Sincronización automática de esquemas para desarrollo
  logging: process.env.NODE_ENV === 'development',
};

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL') || databaseConfig.url,
    ssl: {
      rejectUnauthorized: false,
    },
    autoLoadEntities: true,
    synchronize: true,
    logging: configService.get<string>('NODE_ENV') === 'development',
  }),
};
