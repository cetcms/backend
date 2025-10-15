import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentAuth } from 'src/auth/decorators';
import { CompanyRole, User } from 'src/generated/graphql';
import { MediaFileRepository, UserRepository } from 'src/repositories';

import { MediaFileExtend } from '../media-file/media-file.extend';

@Resolver(User)
export class UserExtend {
  constructor(
    private readonly user: UserRepository,
    private readonly mediaFile: MediaFileRepository,
    private readonly mediaFileExtend: MediaFileExtend
  ) {}

  @ResolveField(() => String, { nullable: true })
  async avatarUrl(@Parent() user: User) {
    if (user.avatar) {
      const file = await this.mediaFile.findOneById(user.avatar);
      if (file) {
        return this.mediaFileExtend.url(file);
      }
    }
    return null;
  }

  @ResolveField(() => CompanyRole)
  role(@Parent() user: User, @CurrentAuth() auth: CurrentAuth) {
    const companyUser = user.companies?.find((c) => c.companyId === auth.companyId);
    return companyUser?.role;
  }
}
