import { registerAs } from '@nestjs/config';

export const CacheConfig = {
  ttl: parseInt(process.env.CACHE_TTL || '300', 10) || 300, // 默认5分钟
  max: parseInt(process.env.CACHE_MAX || '1000', 10) || 1000, // 最大缓存条目数
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10) || 6379,
    username: process.env.REDIS_USERNAME || '',
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_CACHE_DB || '1', 10) || 1, // 使用独立的 DB
  },
};

export default registerAs('cache', () => CacheConfig);
