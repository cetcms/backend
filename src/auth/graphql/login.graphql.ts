import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Target } from 'src/generated/graphql/prisma';

@InputType()
export class LoginInput {
  @Field(() => String)
  account: string;
  @Field(() => String, { nullable: true })
  companyId?: string;
  @Field(() => String)
  password: string;
  @Field(() => Target, { nullable: true, defaultValue: Target.User })
  target?: Target;
}

@InputType()
export class LoginMeta {
  @Field(() => String, { nullable: true })
  fingerprint?: string | null;
  @Field(() => String, { nullable: true })
  userAgent?: string | null;
  @Field(() => String, { nullable: true })
  ip?: string | null;
}

@ObjectType()
export class Login {
  @Field(() => Target)
  target: Target;
  @Field(() => String)
  accessType: string;
  @Field(() => String)
  accessToken: string;
  @Field(() => Number)
  accessTimeout: number;
}
