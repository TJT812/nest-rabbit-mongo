import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notifications/notification.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: process.env.RABBIT_MQ_URL,
      queue: process.env.RABBIT_MQ_NOTIFICATION_QUEUE,
      noAck: false,
    },
  });

  await app.startAllMicroservices();
}
bootstrap();
