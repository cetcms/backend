import { Field, ObjectType } from '@nestjs/graphql';

import { ContentDataType } from './content-type.graphql';

@ObjectType()
export class WebsiteSeoPage {
  @Field(() => Number)
  id: number;

  @Field(() => String)
  apiId: string;

  @Field(() => String)
  document: string;

  @Field(() => String)
  documentId: string;

  @Field(() => String)
  documentTitle: string;

  @Field(() => ContentDataType)
  contentType: ContentDataType;

  @Field(() => String)
  url: string;

  @Field(() => String)
  title: string;
}
