import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { mongoDbConfig } from 'src/config/app.conf';
import { DatabaseModule } from 'src/db/db.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  userModelName,
  userSchema,
  userConnectionName,
} from 'src/db/schemas/user.schema';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AllExceptionsFilter } from 'src/http/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongoDbConfig],
    }),
    DatabaseModule,
    MongooseModule.forFeature(
      [{ name: userModelName, schema: userSchema }],
      userConnectionName,
    ),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class UserModule {}
