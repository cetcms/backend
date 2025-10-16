import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentAuth } from 'src/auth/decorators';
import { CompanyRole, Member } from 'src/generated/graphql';
import { MediaFileRepository, MemberRepository } from 'src/repositories';

import { MediaFileExtend } from '../media-file/media-file.extend';

@Resolver(Member)
export class MemberExtend {
  constructor(
    private readonly member: MemberRepository,
    private readonly mediaFile: MediaFileRepository,
    private readonly mediaFileExtend: MediaFileExtend
  ) {}

  @ResolveField(() => String, { nullable: true })
  async avatarUrl(@Parent() member: Member) {
    if (member.avatar) {
      const file = await this.mediaFile.findOneById(member.avatar);
      if (file) {
        return this.mediaFileExtend.url(file);
      }
    }
    return null;
  }

  @ResolveField(() => CompanyRole)
  role(@Parent() member: Member, @CurrentAuth() auth: CurrentAuth) {
    const companyMember = member.companies?.find((c) => c.companyId === auth.companyId);
    return companyMember?.role;
  }
}
