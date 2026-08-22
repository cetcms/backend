import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Admin } from 'src/generated/graphql';
import { MediaFileRepository } from 'src/repositories';

import { MediaFileExtend } from '../media-file/media-file.extend';

@Resolver(Admin)
export class AdminExtend {
  constructor(
    private readonly mediaFile: MediaFileRepository,
    private readonly mediaFileExtend: MediaFileExtend
  ) {}

  @ResolveField(() => String, { nullable: true })
  async avatarUrl(@Parent() admin: Admin) {
    if (admin.avatar) {
      const file = await this.mediaFile.findOneById(admin.avatar);
      if (file) {
        return this.mediaFileExtend.url(file);
      }
    }
    return null;
  }
}
