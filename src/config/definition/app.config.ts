import { registerAs } from '@nestjs/config';

export const AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  host: process.env.HOST || '127.0.0.1',
  environment: process.env.NODE_ENV || 'development',
  mediaBaseUrl: process.env.MEDIA_BASE_URL || 'http://localhost:3000/media',
  defaultLocaleLang: process.env.DEFAULT_LOCALE_LANG || 'en',
  defaultLocaleNs: process.env.DEFAULT_LOCALE_NS || 'common',
  locale: {
    defaultLang: process.env.DEFAULT_LOCALE_LANG || 'en',
    defaultNs: process.env.DEFAULT_LOCALE_NS || 'common',
  },
  auth: {
    enableFingerprint: process.env.ENABLE_FINGERPRINT === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'ADMIN_SECRET_3325',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  db: {
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10) || 3306,
    membername: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'test',
    provider: process.env.DATABASE_PROVIDER || 'postgres',
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10) || 6379,
    membername: process.env.REDIS_USERNAME || '',
    password: process.env.REDIS_PASSWORD || '',
    db: 0,
  },
};

export default registerAs('app', () => AppConfig);
