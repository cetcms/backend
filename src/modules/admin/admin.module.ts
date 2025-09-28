import { Module } from '@nestjs/common';

import * as Resolvers from './resolvers';
import * as Services from './services';

@Module({
  providers: [...Object.values(Services), ...Object.values(Resolvers)],
  exports: [...Object.values(Services)],
})
export class AdminModule {}
