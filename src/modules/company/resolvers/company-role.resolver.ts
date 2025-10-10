import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth, UsePermission } from 'src/auth/decorators';
import { PermissionInfo } from 'src/auth/graphql';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  Target,
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
  @UsePermission([Target.Admin, Target.User])
  @Query(() => CompanyRole)
  findOneCompanyRole(@Args() args: FindUniqueCompanyRoleArgs): Promise<CompanyRole> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询企业角色
   * @param args
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => PaginatedCompanyRole)
  paginateCompanyRoles(@Args() args: FindManyCompanyRoleArgs): Promise<IPaginated<CompanyRole>> {
    return this.service.paginate(args);
  }

  /**
   * 新增企业角色
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => CompanyRole)
  createOneCompanyRole(@Args() args: CreateOneCompanyRoleArgs): Promise<CompanyRole> {
    return this.service.createOne(args);
  }

  /**
   * 修改企业角色
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => CompanyRole)
  updateOneCompanyRole(@Args() args: UpdateOneCompanyRoleArgs): Promise<CompanyRole> {
    return this.service.updateOne(args);
  }

  /**
   * 获取企业角色权限列表
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => [PermissionInfo])
  listCompanyRolePermission(
    @CurrentAuth() auth: CurrentAuth,
    @Args('where', { nullable: true }) where?: CompanyRoleWhereUniqueInput
  ) {
    return this.service.permissionInfo(auth, where);
  }
}
