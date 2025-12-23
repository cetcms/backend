import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class WebsiteContentType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => ContentDataType)
  type: ContentDataType;
}

export enum ContentDataType {
  Collection = 'Collection',
  Single = 'Single',
}
registerEnumType(ContentDataType, { name: 'ContentDataType', description: undefined });
