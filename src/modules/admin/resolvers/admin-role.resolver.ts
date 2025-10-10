import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth, UsePermission } from 'src/auth/decorators';
import { PermissionInfo } from 'src/auth/graphql';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import {
  AdminRole,
  Target,
  CreateOneAdminRoleArgs,
  FindManyAdminRoleArgs,
  FindUniqueAdminRoleArgs,
  UpdateOneAdminRoleArgs,
  AdminRoleWhereUniqueInput,
} from 'src/generated/graphql';

import { AdminRoleService } from '../services';

const PaginatedAdminRole = Paginated(AdminRole);

/**
 * 管理员角色管理
 * @group Admin
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class AdminRoleResolver {
  constructor(private readonly service: AdminRoleService) {}

  /**
   * 查询单个管理员角色
   * @param args
   */
  @UsePermission([Target.Admin])
  @Query(() => AdminRole)
  findOneAdminRole(@Args() args: FindUniqueAdminRoleArgs): Promise<AdminRole> {
    return this.service.findOneByUnique(args);
  }

  /**
   * 分页查询管理员角色
   * @param args
   */
  @UsePermission([Target.Admin])
  @Query(() => PaginatedAdminRole)
  paginateAdminRoles(@Args() args: FindManyAdminRoleArgs): Promise<IPaginated<AdminRole>> {
    return this.service.paginate(args);
  }

  /**
   * 新增管理员角色
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => AdminRole)
  createOneAdminRole(@Args() args: CreateOneAdminRoleArgs): Promise<AdminRole> {
    return this.service.createOne(args);
  }

  /**
   * 修改管理员角色
   * @param args
   */
  @UsePermission([Target.Admin])
  @Mutation(() => AdminRole)
  updateOneAdminRole(@Args() args: UpdateOneAdminRoleArgs): Promise<AdminRole> {
    return this.service.updateOne(args);
  }

  /**
   * 获取企业角色权限列表
   */
  @UsePermission([Target.Admin])
  @Query(() => PermissionInfo)
  listAdminRolePermission(
    @CurrentAuth() auth: CurrentAuth,
    @Args('where', { nullable: true }) where?: AdminRoleWhereUniqueInput
  ) {
    return this.service.permissionInfo(auth, where);
  }
}
