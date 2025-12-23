import { Module } from '@nestjs/common';

import { SeoModule } from './seo/seo.module';
import { SiteModule } from './site/site.module';
import { StrapiModule } from './strapi/strapi.module';

@Module({
  imports: [StrapiModule, SiteModule, SeoModule],
})
export class ProvidersModule {}
