import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { HttpConfig } from './config/app.conf';
import { UserModule } from './modules/user/user.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const config = new ConfigService<HttpConfig>();
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UserModule,
    {
      transport: Transport.TCP,
      options: {
        port: Number(config.getOrThrow('port')),
      },
    },
    // add logger
  );

  await app.listen();
}

bootstrap();
