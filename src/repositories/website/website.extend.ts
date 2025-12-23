import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Website } from 'src/generated/graphql';
import { WebsiteRepository } from 'src/repositories';

@Resolver(Website)
export class WebsiteExtend {
  constructor(private readonly website: WebsiteRepository) {}

  @ResolveField(() => Boolean)
  hasCmsApiToken(@Parent() website: Website) {
    return Boolean(website.cmsApiToken);
  }

  @ResolveField(() => String)
  cmsApiToken() {
    return '';
  }
}
