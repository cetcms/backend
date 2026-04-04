import { Module } from '@nestjs/common';

import { SiteModule } from './site/site.module';
import { StrapiModule } from './strapi/strapi.module';

@Module({
  imports: [StrapiModule, SiteModule],
})
export class ProvidersModule {}
