import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Company } from 'src/generated/graphql';
import { MediaFileRepository } from 'src/repositories';

import { MediaFileExtend } from '../media-file/media-file.extend';

@Resolver(Company)
export class CompanyExtend {
  constructor(
    private readonly mediaFile: MediaFileRepository,
    private readonly mediaFileExtend: MediaFileExtend
  ) {}

  @ResolveField(() => String, { nullable: true })
  async logoUrl(@Parent() company: Company) {
    if (company.logo) {
      const file = await this.mediaFile.findOneById(company.logo);
      if (file) {
        return this.mediaFileExtend.url(file);
      }
    }
    return null;
  }
}
