import { LogLevel } from '@nestjs/common';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_DB_CONN_STR: string;
      MONGO_DB_NAME: string;
      RABBIT_MQ_URL: string;
      LOG_LEVEL: LogLevel;
      PORT: number;
      STAGE: string;
      RABBIT_MQ_URL: string;
      RABBIT_MQ_NOTIFICATION_QUEUE: string;
    }
  }
}

export {};
