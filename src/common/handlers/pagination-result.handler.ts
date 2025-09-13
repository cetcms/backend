import { IPaginated } from 'src/common/dto';

export function PaginationResultHandler<T>(items: T[], take: number, skip: number, count: number): IPaginated<T> {
  return {
    items,
    pagination: {
      take,
      skip,
      page: skip / take + 1,
      totalPages: Math.ceil(count / take),
      totalCount: count,
    },
  };
}
