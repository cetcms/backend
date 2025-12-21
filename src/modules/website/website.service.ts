import { Injectable, NotFoundException } from '@nestjs/common';
import { CurrentAuth } from 'src/auth/decorators';
import { PaginationResult } from 'src/common/dto';
import {
  CreateOneWebsiteArgs,
  FindManyWebsiteArgs,
  FindUniqueWebsiteArgs,
  UpdateOneWebsiteArgs,
} from 'src/generated/graphql';
import { WebsiteRepository } from 'src/repositories';

@Injectable()
export class WebsiteService {
  constructor(private readonly website: WebsiteRepository) {}

  async findOneByUnique(args: FindUniqueWebsiteArgs) {
    const { where } = args;
    const website = await this.website.findUnique(where);
    if (website) {
      return website;
    }
    throw new NotFoundException('网站不存在');
  }

  async paginate(args: FindManyWebsiteArgs, auth?: CurrentAuth) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    // 对企业可查询的范围做限制
    if (auth && auth.companyId) {
      args.where = {
        ...args.where,
        companyId: { equals: auth.companyId },
      };
    }
    const [websites, totalCount] = await this.website.findManyAndCount(args);
    return PaginationResult(websites, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneWebsiteArgs) {
    const { data } = args;
    return this.website.create(data);
  }

  updateOne(args: UpdateOneWebsiteArgs) {
    const { where, data } = args;
    return this.website.update(where, data);
  }
}
