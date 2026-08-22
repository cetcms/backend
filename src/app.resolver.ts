import { Query, Resolver } from '@nestjs/graphql';

import { AppService } from 'src/app.service';

@Resolver()
export class AppResolver {
  constructor(private appService: AppService) {}

  @Query(() => String)
  helloWorld(): string {
    return 'Hello World!';
  }

  @Query(() => String)
  healthCheck() {
    return this.appService.health();
  }
}
