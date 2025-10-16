import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  Client,
  CompanyMember,
  CreateOneCompanyMemberArgs,
  FindManyCompanyMemberArgs,
  FindUniqueCompanyMemberArgs,
  UpdateOneCompanyMemberArgs,
} from 'src/generated/graphql';

import { CompanyMemberService } from '../services';

const PaginatedCompanyMember = Paginated(CompanyMember);

/**
 * 企业成员管理
 * @group Company
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class CompanyMemberResolver {
  constructor(private readonly service: CompanyMemberService) {}

  /**
   * 查询单个企业成员关联
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => CompanyMember)
  findOneCompanyMember(@Args() args: FindUniqueCompanyMemberArgs): Promise<CompanyMember> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询企业成员关联
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => PaginatedCompanyMember)
  paginateCompanyMembers(@Args() args: FindManyCompanyMemberArgs): Promise<IPaginated<CompanyMember>> {
    return this.service.paginate(args);
  }

  /**
   * 新增企业成员关联
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => CompanyMember)
  createOneCompanyMember(@Args() args: CreateOneCompanyMemberArgs): Promise<CompanyMember> {
    return this.service.createOne(args);
  }

  /**
   * 修改企业成员关联
   * @param args
   */
  @UsePermission([Client.Admin])
  @Mutation(() => CompanyMember)
  updateOneCompanyMember(@Args() args: UpdateOneCompanyMemberArgs): Promise<CompanyMember> {
    return this.service.updateOne(args);
  }
}
