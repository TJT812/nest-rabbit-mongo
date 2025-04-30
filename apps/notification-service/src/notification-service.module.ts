import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig, httpConfig, rabbitMqConfig } from './config/app.conf';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './http/all-exceptions.filter';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [httpConfig, rabbitMqConfig, appConfig],
    envFilePath: ['.env'],
  })],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService, { provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class NotificationServiceModule {}
