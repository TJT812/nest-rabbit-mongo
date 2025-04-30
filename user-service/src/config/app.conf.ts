import { registerAs } from '@nestjs/config';
import { LogLevelEnum, StageEnum } from 'src/common/enums';

interface HttpConfig {
  port: number;
}

interface MongoDbConfig {
  mongoDbConnectionString: string;
  mongoDbName: string;
}

interface RabbitMqConfig {
  rabbitMqUrl: string;
  notificationQueue: string;
}

interface AppConfig {
  logLevel: LogLevelEnum;
  stage: StageEnum;
}

const httpConfig = registerAs(
  'http',
  (): HttpConfig => ({
    port: Number(process.env.PORT) || 3001,
  }),
);
const mongoDbConfig = registerAs(
  'mongoDb',
  (): MongoDbConfig => ({
    mongoDbConnectionString: process.env.MONGO_DB_CONN_STR,
    mongoDbName: process.env.MONGO_DB_NAME,
  }),
);
const rabbitMqConfig = registerAs(
  'rabbitMq',
  (): RabbitMqConfig => ({
    rabbitMqUrl: process.env.RABBIT_MQ_URL || '',
    notificationQueue: process.env.RABBIT_MQ_NOTIFICATION_QUEUE || '',
  }),
);
const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    logLevel: (process.env.LOG_LEVEL as LogLevelEnum) || LogLevelEnum.info,
    stage: (process.env.STAGE as StageEnum) || StageEnum.dev,
  }),
);

export {
  HttpConfig,
  MongoDbConfig,
  RabbitMqConfig,
  AppConfig,
  httpConfig,
  mongoDbConfig,
  rabbitMqConfig,
  appConfig,
};
