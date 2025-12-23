import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  Client,
  CreateOneWebsiteArgs,
  FindManyWebsiteArgs,
  FindUniqueWebsiteArgs,
  UpdateOneWebsiteArgs,
  Website,
} from 'src/generated/graphql';

import { WebsiteService } from '../services';

const PaginatedWebsite = Paginated(Website);

/**
 * 网站管理
 * @group Website
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class WebsiteResolver {
  constructor(private readonly service: WebsiteService) {}

  /**
   * 查询单个网站
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => Website)
  findOneWebsite(@Args() args: FindUniqueWebsiteArgs): Promise<Website> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询网站列表
   * @param auth
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => PaginatedWebsite)
  paginateWebsites(@CurrentAuth() auth: CurrentAuth, @Args() args: FindManyWebsiteArgs): Promise<IPaginated<Website>> {
    return this.service.paginate(args, auth);
  }

  /**
   * 新增网站
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => Website)
  createOneWebsite(@Args() args: CreateOneWebsiteArgs): Promise<Website> {
    return this.service.createOne(args);
  }

  /**
   * 修改网站
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => Website)
  updateOneWebsite(@Args() args: UpdateOneWebsiteArgs): Promise<Website> {
    return this.service.updateOne(args);
  }
}
