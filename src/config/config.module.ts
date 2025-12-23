import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ConfigService } from './config.service';
import AppConfig from './definition/app.config';
import ProviderConfig from './definition/provider.config';
import StorageConfig from './definition/storage.config';
@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [AppConfig, StorageConfig, ProviderConfig],
      isGlobal: true,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
