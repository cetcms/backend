import { Module } from '@nestjs/common';

import * as Resolvers from './resolvers';
import * as Services from './services';

@Module({
  providers: [...Object.values(Resolvers), ...Object.values(Services)],
  exports: [...Object.values(Services)],
})
export class NotificationModule {}
