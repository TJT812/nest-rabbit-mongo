import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import mongoose, { Mongoose } from 'mongoose';
import { mongoDbConfig } from '../config/app.conf';

@Module({
  providers: [
    {
      provide: 'DB_CONNECTION',
      useFactory: async (
        mongoDb: ConfigType<typeof mongoDbConfig>,
      ): Promise<Mongoose> => {
        const connectionString = mongoDb.mongoDbConnectionString;
        const dbName = mongoDb.mongoDbName;

        const db = await mongoose.connect(connectionString, { dbName });
        return db;
      },
      inject: [mongoDbConfig.KEY],
    },
  ],
  exports: ['DB_CONNECTION'],
})
export class DatabaseModule {}
