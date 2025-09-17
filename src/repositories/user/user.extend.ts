import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentAuth } from 'src/auth/decorators';
import { Auth, CompanyRole, User } from 'src/generated/graphql';
import { UserRepository } from 'src/repositories';

@Resolver(User)
export class UserExtend {
  constructor(private readonly user: UserRepository) {}

  @ResolveField(() => CompanyRole)
  role(@Parent() user: User, @CurrentAuth() auth: Auth) {
    const companyUser = user.companies?.find((c) => c.companyId === auth.companyId);
    return companyUser?.role;
  }
}
