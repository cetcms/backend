import { Module } from '@nestjs/common';

import { WebsiteResolver } from './website.resolver';
import { WebsiteService } from './website.service';

@Module({
  providers: [WebsiteResolver, WebsiteService],
  exports: [WebsiteService],
})
export class WebsiteModule {}
