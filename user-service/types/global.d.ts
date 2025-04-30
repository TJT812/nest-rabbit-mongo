declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_DB_CONN_STR: string;
      MONGO_DB_NAME: string;
      RABBIT_MQ_URL: string;
      LOG_LEVEL: string;
      PORT: number;
      STAGE: string;
      RABBITMQ_DEFAULT_USER: string;
      RABBITMQ_DEFAULT_PASS: string;
    }
  }
}

export {};
