import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { HttpConfig, RabbitMqConfig } from './config/app.conf';
import { UserModule } from './modules/user/user.module';
import { Transport } from '@nestjs/microservices';
import { AllExceptionsFilter } from './http/all-exceptions.filter';
import { WinstonModule } from 'nest-winston';
import { Logger } from '@nestjs/common';
import * as winston from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(UserModule, {
    logger: WinstonModule.createLogger({
      level: process.env.LOG_LEVEL,
      transports: [
        new winston.transports.Console({ format: winston.format.json() }),
      ],
    }),
  });
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
  await app.startAllMicroservices();

  const logger: Logger = app.get(Logger);
  const exceptionFilter = new AllExceptionsFilter(logger);
  app.useGlobalFilters(exceptionFilter);

  await app.listen(port, () => {
    logger.log(`User service is running on: http://localhost:${port}`);
  });
}

bootstrap();
