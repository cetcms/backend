import { ForbiddenException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

import { I18nService } from './i18n.service';

@Resolver()
export class I18nResolver {
  constructor(private readonly i18n: I18nService) {}

  @Query(() => GraphQLJSONObject)
  translations(@Args('scope', { type: () => String }) scope: string) {
    const namespaces = ['models'];
    if (!namespaces.includes(scope)) {
      throw new ForbiddenException(`Invalid scope: ${scope}`);
    }
    return this.i18n.all(scope);
  }
}
