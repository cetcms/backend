import { Type } from '@nestjs/common';
import { Field, Int, ObjectType } from '@nestjs/graphql';

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

export function PaginationResult<T>(items: T[], take: number, skip: number, totalCount: number): IPaginated<T> {
  return {
    items,
    pagination: {
      take,
      skip,
      page: skip / take + 1,
      totalPages: Math.ceil(totalCount / take),
      totalCount,
    },
  };
}
