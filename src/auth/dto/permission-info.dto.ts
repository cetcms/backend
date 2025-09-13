import { Field, ObjectType } from '@nestjs/graphql';
import { Target } from 'src/generated/graphql/prisma';

@ObjectType()
export class PermissionInfo {
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
