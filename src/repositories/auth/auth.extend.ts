import { ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentAuth } from 'src/auth/decorators';
import { Auth } from 'src/generated/graphql';
import { AuthRepository } from 'src/repositories';

@Resolver(Auth)
export class AuthExtend {
  constructor(private readonly admin: AuthRepository) {}

  @ResolveField(() => [String])
  permissions(@CurrentAuth() auth: CurrentAuth) {
    return auth.permissions;
  }
}
