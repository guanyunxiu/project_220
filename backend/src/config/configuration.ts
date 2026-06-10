export default () => ({
  port: parseInt(process.env.PORT, 10) || 3220,

  database: {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'novel_platform',
    charset: 'utf8mb4_unicode_ci',
    timezone: '+08:00',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  bull: {
    defaultQueue: 'novel-queue',
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },

  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'novel-platform',
  },

  meilisearch: {
    host: process.env.MEILISEARCH_HOST || 'http://localhost',
    port: parseInt(process.env.MEILISEARCH_PORT, 10) || 7700,
    apiKey: process.env.MEILISEARCH_API_KEY || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'novel-platform-secret-key-2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
});
