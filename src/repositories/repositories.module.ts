import { Global, Module } from '@nestjs/common';

import * as Repositories from './index';

@Global()
@Module({
  providers: [...Object.values(Repositories)],
  exports: [...Object.values(Repositories)],
})
export class RepositoriesModule {}
