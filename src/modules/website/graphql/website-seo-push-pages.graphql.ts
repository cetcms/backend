import { ArgsType, Field } from '@nestjs/graphql';
import { FindUniqueWebsiteArgs } from 'src/generated/graphql';

@ArgsType()
export class WebsiteSeoPushPagesArgs extends FindUniqueWebsiteArgs {
  @Field(() => [String])
  urls: string[];
}
