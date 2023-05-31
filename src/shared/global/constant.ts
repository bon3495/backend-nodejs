export const SERVER_PORT = 5000;

export const BASE_PATH = '/api/v1';
export const QUEUES_PATH = '/queues';

export const USER_NAME_MIN_LENGTH = 4;
export const USER_NAME_MAX_LENGTH = 8;
export const SALT_ROUND = 10;
export const RANDOM_NUMBER = 12;

export const CONCURRENCY_NUMBER = 5;

export const ACCESS_TOKEM_EXPIRES = '1d';
export const REFRESH_TOKEM_EXPIRES = 1000 * 60 * 60 * 24 * 365;

export const GLOBAL = {
  ROOT_SERVER: 'rootServer',
  SETUP_DATABASE: 'setupDatabase',
  REDIS_CONNECTION: 'redisConnection',

  // Cache
  USER_CACHE: 'userCache',
  AUTH_CACHE: 'authCache',

  // Queue
  AUTH: 'auth',
  USER: 'user',

  // Worker
  AUTH_WORKER: 'authWorker',
  USER_WORKER: 'userWorker',
} as const;

export const QUEUES = {
  ADD_AUTH_USER_JOB: 'addAuthUserJob',
  ADD_USER_JOB: 'addUserJob',
} as const;
