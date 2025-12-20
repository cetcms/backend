import { Resolver } from '@nestjs/graphql';
import { Website } from 'src/generated/graphql';
import { WebsiteRepository } from 'src/repositories';

@Resolver(Website)
export class WebsiteExtend {
  constructor(private readonly website: WebsiteRepository) {}
}
