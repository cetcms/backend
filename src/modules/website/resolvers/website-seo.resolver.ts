import { UseGuards } from '@nestjs/common';
import {Args, Mutation, Query, Resolver} from '@nestjs/graphql';
import { CurrentAuth, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { Client, FindUniqueWebsiteArgs } from 'src/generated/graphql';

import { WebsiteSeoPage } from '../graphql';
import { WebsiteSeoService } from '../services';

/**
 * 网站 SEO 管理
 * @group Website
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class WebsiteSeoResolver {
  constructor(private readonly service: WebsiteSeoService) {}

  /**
   * 网站 SEO 页面列表
   * @param auth
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => [WebsiteSeoPage])
  listWebsiteSeoPage(@CurrentAuth() auth: CurrentAuth, @Args() args: FindUniqueWebsiteArgs) {
    return this.service.sitePages(auth, args);
  }
  /**
   * 分析网站所有页面
   * @param auth
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Mutation(() => Boolean)
  pushAllPagesToAnalyze(@CurrentAuth() auth: CurrentAuth, @Args() args: FindUniqueWebsiteArgs) {
    return this.service.pushAllPagesToAnalyze(auth, args);
  }
}
