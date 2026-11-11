import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/database.config';
import { UsersModule } from './modules/users/users.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { LoansModule } from './modules/loans/loans.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { RenewalsModule } from './modules/renewals/renewals.module';
import { FinesModule } from './modules/fines/fines.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    AuthModule,
    UsersModule,
    ResourcesModule,
    LoansModule,
    ReservationsModule,
    RenewalsModule,
    FinesModule,
  ],
})
export class AppModule {}
