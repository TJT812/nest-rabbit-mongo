import { Global, Logger, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  appConfig,
  httpConfig,
  mongoDbConfig,
  rabbitMqConfig,
} from '../../config/app.conf';
import { MongooseModule } from '@nestjs/mongoose';
import { userModelName, userSchema } from '../../db/schemas/user.schema';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AllExceptionsFilter } from '../../http/all-exceptions.filter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { servicesEnum } from '../../common/enums';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [
    HealthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [httpConfig, mongoDbConfig, rabbitMqConfig, appConfig],
      // envFilePath: ['./apps/user-service/.env'],
    }),
    MongooseModule.forRootAsync({
      useFactory: (mongoDb: ConfigType<typeof mongoDbConfig>) => {
        const connectionString = mongoDb.mongoDbConnectionString;
        const dbName = mongoDb.mongoDbName;
        return {
          uri: connectionString,
          dbName: dbName,
        };
      },
      inject: [mongoDbConfig.KEY],
    }),
    MongooseModule.forFeature([{ name: userModelName, schema: userSchema }]),
    ClientsModule.registerAsync({
      clients: [
        {
          name: servicesEnum.NOTIFICATION_SERVICE,
          useFactory: (rabbitMq: ConfigType<typeof rabbitMqConfig>) => ({
            transport: Transport.RMQ,
            options: {
              urls: [rabbitMq?.rabbitMqUrl ?? process.env.RABBIT_MQ_URL],
              queue:
                rabbitMq?.notificationQueue ??
                process.env.RABBIT_MQ_NOTIFICATION_QUEUE,
              noAck: true,
            },
          }),
          inject: [rabbitMqConfig.KEY],
        },
      ],
      isGlobal: true,
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    Logger,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class UserModule {}
