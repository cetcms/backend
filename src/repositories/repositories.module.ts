import { Global, Module } from '@nestjs/common';

import * as Extends from './extends';

import * as Repositories from './index';

@Global()
@Module({
  providers: [...Object.values(Repositories), ...Object.values(Extends)],
  exports: [...Object.values(Repositories)],
})
export class RepositoriesModule {}
