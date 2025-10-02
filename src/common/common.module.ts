import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Global, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { CommonResolver } from './common.resolver';
import * as Services from './services';

@Global()
@Module({
  exports: [GraphQLModule, ...Object.values(Services)],
  providers: [CommonResolver, ...Object.values(Services)],
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
      debug: true,
    }),
  ],
})
export class CommonModule {}
