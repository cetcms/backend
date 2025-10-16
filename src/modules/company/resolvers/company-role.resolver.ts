import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth, UsePermission } from 'src/auth/decorators';
import { PermissionGroup } from 'src/auth/graphql';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  Client,
  CompanyRole,
  CreateOneCompanyRoleArgs,
  FindManyCompanyRoleArgs,
  FindUniqueCompanyRoleArgs,
  UpdateOneCompanyRoleArgs,
  CompanyRoleWhereUniqueInput,
} from 'src/generated/graphql';

import { CompanyRoleService } from '../services';

const PaginatedCompanyRole = Paginated(CompanyRole);

/**
 * 企业角色管理
 * @group Company
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class CompanyRoleResolver {
  constructor(private readonly service: CompanyRoleService) {}

  /**
   * 查询单个企业角色
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => CompanyRole)
  findOneCompanyRole(@Args() args: FindUniqueCompanyRoleArgs): Promise<CompanyRole> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询企业角色
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => PaginatedCompanyRole)
  paginateCompanyRoles(@Args() args: FindManyCompanyRoleArgs): Promise<IPaginated<CompanyRole>> {
    return this.service.paginate(args);
  }

  /**
   * 新增企业角色
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Mutation(() => CompanyRole)
  createOneCompanyRole(@Args() args: CreateOneCompanyRoleArgs): Promise<CompanyRole> {
    return this.service.createOne(args);
  }

  /**
   * 修改企业角色
   * @param args
   */
  @UsePermission([Client.Admin, Client.Company])
  @Mutation(() => CompanyRole)
  updateOneCompanyRole(@Args() args: UpdateOneCompanyRoleArgs): Promise<CompanyRole> {
    return this.service.updateOne(args);
  }

  /**
   * 获取企业角色权限列表
   */
  @UsePermission([Client.Admin, Client.Company])
  @Query(() => PermissionGroup)
  listCompanyRolePermission(
    @CurrentAuth() auth: CurrentAuth,
    @Args('where', { nullable: true }) where?: CompanyRoleWhereUniqueInput
  ) {
    return this.service.permissionGroupInfo(auth, where);
  }
}
