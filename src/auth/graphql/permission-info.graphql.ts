import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Client } from 'src/generated/graphql/prisma';
import { PermissionAlias } from 'src/generated/permissions';

@ObjectType()
export class PermissionItem {
  @Field(() => String)
  name: string;

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

  @Field(() => [Client])
  clients: Array<Client>;
}

@ObjectType()
export class PermissionInfo {
  @Field(() => [PermissionItem])
  items: Array<PermissionItem>;

  @Field(() => [String])
  allowSelect: Array<string>;

  @Field(() => [String])
  allowUnselect: Array<string>;

  @Field(() => [PermissionAlias], { defaultValue: [], nullable: true })
  alias: PermissionAlias[];
}

@ObjectType()
export class PermissionGroupItem {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  label: string;

  @Field(() => [PermissionGroupItem])
  items: Array<PermissionGroupItem>;
}

@ObjectType()
export class PermissionGroup {
  @Field(() => [PermissionGroupItem])
  groups: Array<PermissionGroupItem>;

  @Field(() => [String])
  allowSelect: Array<string>;

  @Field(() => [String])
  allowUnselect: Array<string>;

  @Field(() => [PermissionAlias], { defaultValue: [], nullable: true })
  alias: PermissionAlias[];
}

registerEnumType(PermissionAlias, { name: 'PermissionAlias', description: undefined });
