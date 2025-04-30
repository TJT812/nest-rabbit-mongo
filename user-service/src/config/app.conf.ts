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
  rabbitMqUser: string;
  rabbitMqPassword: string;
}

interface AppConfig {
  logLevel: LogLevelEnum;
  stage: StageEnum;
}

function getHttpConfig(): HttpConfig {
  return {
    port: Number(process.env.PORT) || 3001,
  };
}

function getRabbitMqConfig(): RabbitMqConfig {
  return {
    rabbitMqUser: process.env.RABBITMQ_DEFAULT_USER || '',
    rabbitMqPassword: process.env.RABBITMQ_DEFAULT_PASS || '',
  };
}

function getAppConfig(): AppConfig {
  return {
    logLevel: (process.env.LOG_LEVEL as LogLevelEnum) || LogLevelEnum.info,
    stage: (process.env.STAGE as StageEnum) || StageEnum.dev,
  };
}
//

const mongoDbConfig = registerAs(
  'mongoDb',
  (): MongoDbConfig => ({
    mongoDbConnectionString: process.env.MONGO_DB_CONN_STR,
    mongoDbName: process.env.MONGO_DB_NAME,
  }),
);

export {
  getHttpConfig,
  getRabbitMqConfig,
  getAppConfig,
  HttpConfig,
  MongoDbConfig,
  RabbitMqConfig,
  AppConfig,
  //
  mongoDbConfig,
};
