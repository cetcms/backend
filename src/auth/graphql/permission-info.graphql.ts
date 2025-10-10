import { Field, ObjectType } from '@nestjs/graphql';
import { Target } from 'src/generated/graphql/prisma';

@ObjectType()
export class PermissionItem {
  @Field(() => String)
  subject: string;

  @Field(() => String)
  subjectLabel: string;

  @Field(() => String)
  group: string;

  @Field(() => String)
  action: string;

  @Field(() => String)
  actionLabel: string;

  @Field(() => [Target])
  targets: Array<Target>;
}

@ObjectType()
export class PermissionInfo {
  @Field(() => [PermissionItem])
  items: Array<PermissionItem>;

  @Field(() => [String])
  allowSelect: Array<string>;

  @Field(() => [String])
  allowUnselect: Array<string>;
}
