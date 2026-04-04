import { Module } from '@nestjs/common';
import { SiteModule } from 'src/providers/site/site.module';
import { StrapiModule } from 'src/providers/strapi/strapi.module';

import * as Resolvers from './resolvers';
import * as Services from './services';
import { WebsiteController } from './website.controller';

@Module({
  imports: [StrapiModule, SiteModule],
  providers: [...Object.values(Services), ...Object.values(Resolvers)],
  exports: [...Object.values(Services)],
  controllers: [WebsiteController],
})
export class WebsiteModule {}
