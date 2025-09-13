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
  @Field(() => String)
  fingerprint: string;
  @Field(() => String)
  userAgent: string;
  @Field(() => String)
  ip: string;
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
