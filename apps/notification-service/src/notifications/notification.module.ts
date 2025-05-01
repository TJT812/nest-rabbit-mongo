import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification.controller';
import { NotificationService } from './notification.service';
import { ConfigModule } from '@nestjs/config';
import { appConfig, httpConfig, rabbitMqConfig } from '../config/app.conf';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { servicesEnum } from '../common/enums';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [httpConfig, rabbitMqConfig, appConfig],
      envFilePath: ['.env'],
    }),
    ClientsModule.registerAsync([
      {
        name: servicesEnum.NOTIFICATION_SERVICE,
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RABBIT_MQ_URL ?? ''],
            queue: process.env.RABBIT_MQ_NOTIFICATION_QUEUE ?? '',
            noAck: false,
          },
        }),
      },
    ]),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationService],
})
export class NotificationServiceModule {}
