import { ArgsType, Field } from '@nestjs/graphql';
import { FindUniqueWebsiteArgs } from 'src/generated/graphql';

@ArgsType()
export class PushPagesToAnalyzeArgs extends FindUniqueWebsiteArgs {
  @Field(() => [String])
  urls: string[];
}
