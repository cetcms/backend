import { CacheModule as NestCacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigService } from 'src/config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const cacheConfig = configService.getCacheConfig();
        return {
          store: await redisStore({
            socket: {
              host: cacheConfig.redis.host,
              port: cacheConfig.redis.port,
            },
            username: cacheConfig.redis.username || undefined,
            password: cacheConfig.redis.password || undefined,
            database: cacheConfig.redis.db,
          }),
          ttl: cacheConfig.ttl * 1000, // 转换为毫秒
          max: cacheConfig.max,
        } as CacheModuleAsyncOptions;
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
