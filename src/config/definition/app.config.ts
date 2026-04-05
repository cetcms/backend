import { registerAs } from '@nestjs/config';

export const AppConfig = {
  port: parseInt(process.env.PORT || '3325', 10) || 3325,
  host: process.env.HOST || '127.0.0.1',
  environment: process.env.NODE_ENV || 'development',
  mediaBaseUrl: process.env.MEDIA_BASE_URL || 'http://localhost:3325/media',
  defaultLocaleLang: process.env.DEFAULT_LOCALE_LANG || 'en',
  defaultLocaleNs: process.env.DEFAULT_LOCALE_NS || 'common',
  locale: {
    defaultLang: process.env.DEFAULT_LOCALE_LANG || 'en',
    defaultNs: process.env.DEFAULT_LOCALE_NS || 'common',
  },
  auth: {
    enableFingerprint: process.env.ENABLE_FINGERPRINT === 'true',
  },
  domain: {
    admin: process.env.ADMIN_DOMAIN || 'localhost',
    member: process.env.MEMBER_DOMAIN || '127.0.0.1',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  db: {
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'cetcms',
    provider: process.env.DATABASE_PROVIDER || 'postgresql',
  },
};

export default registerAs('app', () => AppConfig);
