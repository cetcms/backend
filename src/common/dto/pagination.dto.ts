import { Type } from '@nestjs/common';
import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

export interface IPagination {
  take: number;
  skip: number;
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface IPaginated<T> {
  readonly items: T[];
  readonly pagination: IPagination;
}

@ArgsType()
export class PaginationArgs {
  @Field(() => GraphQLJSON, {
    nullable: true,
    description: 'List filter input',
  })
  where?: any;

  @Field(() => GraphQLJSON, { nullable: true, description: 'List sort input' })
  orderBy?: any;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 10,
    description: 'List page size',
  })
  limit?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 1,
    description: 'Current page',
  })
  page?: number;
}

@ObjectType('Pagination')
export class Pagination implements IPagination {
  @Field(() => Int)
  take: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  totalCount: number;
}

export function Paginated<T>(modelClass: Type<T>): Type<IPaginated<T>> {
  @ObjectType(`Paginated${modelClass.name}`)
  abstract class PaginatedClass implements IPaginated<T> {
    @Field(() => [modelClass], { nullable: true })
    items: T[];

    @Field(() => Pagination, { nullable: true })
    pagination: Pagination;
  }

  return PaginatedClass as Type<IPaginated<T>>;
}
