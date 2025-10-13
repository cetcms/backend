import { ForbiddenException } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

import { I18nService } from './i18n.service';

@Resolver()
export class I18nResolver {
  constructor(private readonly i18n: I18nService) {}

  @Query(() => GraphQLJSONObject)
  translations(@Args('scopes', { type: () => [String] }) scopes: string[]) {
    const namespaces = ['models', 'permissions'];
    for (const scope of scopes) {
      if (!namespaces.includes(scope)) {
        throw new ForbiddenException(`Invalid scope: ${scope}`);
      }
    }

    if (scopes.length === 1) {
      return this.i18n.all(scopes[0]);
    }

    const result = {};
    for (const scope of scopes) {
      result[scope] = this.i18n.all(scope);
    }
    return result;
  }
}
