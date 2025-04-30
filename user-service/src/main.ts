import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { HttpConfig, RabbitMqConfig } from './config/app.conf';
import { UserModule } from './modules/user/user.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(UserModule);
  const config = app.get(ConfigService);
  const port = Number(config.get<HttpConfig>('port') ?? process.env.PORT);
  const rabbitMqUrl =
    config.get<RabbitMqConfig>('rabbitMqUrl') ?? process.env.RABBIT_MQ_URL;

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: rabbitMqUrl,
      queue: 'user',
    },
  });
  // add logger
  await app.startAllMicroservices();
  await app.listen(port, () => {
    console.log(`User service is running on: http://localhost:${port}`);
  });
}

bootstrap();
