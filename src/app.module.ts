import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { I18nModule } from './i18n/i18n.module';
import { ModulesModule } from './modules/modules.module';
import { RepositoriesModule } from './repositories/repositories.module';

@Module({
  imports: [CommonModule, AuthModule, DatabaseModule, I18nModule, RepositoriesModule, ModulesModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
