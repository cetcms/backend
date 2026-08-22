import { Injectable } from '@nestjs/common';

import { IPaginated } from 'src/common/dto';

@Injectable()
export class PaginationService {
  constructor() {}

  result<T>(items: T[], take: number, skip: number, totalCount: number): IPaginated<T> {
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
}
