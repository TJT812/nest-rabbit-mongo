import { registerAs } from '@nestjs/config';
import { LogLevelEnum, StageEnum } from '../common/enums';

interface HttpConfig {
  port: number;
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
  RabbitMqConfig,
  AppConfig,
  httpConfig,
  rabbitMqConfig,
  appConfig,
};
