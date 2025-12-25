import KeyvRedis from '@keyv/redis';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';
import { ConfigService } from 'src/config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const cacheConfig = configService.getCacheConfig();
        const redis = cacheConfig.redis;
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: cacheConfig.ttl * 1000, lruSize: cacheConfig.max }),
            }),
            new KeyvRedis({
              socket: {
                host: redis.host,
                port: redis.port,
              },
              username: redis.username || undefined,
              password: redis.password || undefined,
              database: redis.db,
            }),
          ],
        };
      },
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
