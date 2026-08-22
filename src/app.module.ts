import { Module } from '@nestjs/common';

import { AppResolver } from 'src/app.resolver';
import { CacheModule } from 'src/cache';
import { ConfigModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { I18nModule } from './i18n/i18n.module';
import { ModulesModule } from './modules/modules.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    CommonModule,
    AuthModule,
    DatabaseModule,
    I18nModule,
    RepositoriesModule,
    ModulesModule,
    ProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
