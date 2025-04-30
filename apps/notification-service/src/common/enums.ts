enum LogLevelEnum {
  info = 'info',
  debug = 'debug',
  error = 'error',
  warn = 'warn',
}

enum StageEnum {
  prod = 'prod',
  dev = 'dev',
}

const servicesEnum = {
  NOTIFICATION_SERVICE: 'NOTIFICATION_SERVICE',
};

const userEventTypes = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
}

export { LogLevelEnum, StageEnum, servicesEnum, userEventTypes };
