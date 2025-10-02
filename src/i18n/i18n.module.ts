import { Global, Module } from '@nestjs/common';

import { I18nResolver } from './i18n.resolver';
import { I18nService } from './i18n.service';

@Global()
@Module({
  providers: [I18nService, I18nResolver],
  exports: [I18nService],
})
export class I18nModule {}
