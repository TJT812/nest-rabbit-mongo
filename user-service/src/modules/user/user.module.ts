import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule, ConfigType } from '@nestjs/config';
import {
  appConfig,
  httpConfig,
  mongoDbConfig,
  rabbitMqConfig,
} from 'src/config/app.conf';
import { MongooseModule } from '@nestjs/mongoose';
import { userModelName, userSchema } from 'src/db/schemas/user.schema';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AllExceptionsFilter } from 'src/http/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [httpConfig, mongoDbConfig, rabbitMqConfig, appConfig],
      envFilePath: ['.env'],
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
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class UserModule {}
