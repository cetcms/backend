import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import * as Services from './services';

@Module({
  imports: [HttpModule],
  providers: [...Object.values(Services)],
  exports: [HttpModule, ...Object.values(Services)],
})
export class SeoModule {}
