import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuthUser, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import {
  User,
  CompanyUser,
  Target,
  Status,
} from 'src/generated/graphql';

import { UserManagementService } from './user-management.service';

/**
 * 用户管理综合解析器
 * @module UserManagement
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class UserManagementResolver {
  constructor(private readonly service: UserManagementService) {}

  /**
   * 创建用户并分配到企业
   * @param userData
   * @param companyId
   * @param roleCode
   */
  @UsePermission([Target.Admin])
  @Mutation(() => User)
  async createUserWithCompany(
    @Args('userData') userData: any,
    @Args('companyId', { nullable: true }) companyId?: string,
    @Args('roleCode', { defaultValue: 'user' }) roleCode?: string,
  ) {
    return this.service.createUserWithCompany(userData, companyId, roleCode);
  }

  /**
   * 将用户添加到企业
   * @param userId
   * @param companyId
   * @param roleCode
   */
  @UsePermission([Target.Admin])
  @Mutation(() => CompanyUser)
  addUserToCompany(
    @Args('userId') userId: string,
    @Args('companyId') companyId: string,
    @Args('roleCode', { defaultValue: 'user' }) roleCode: string,
  ): Promise<CompanyUser> {
    return this.service.addUserToCompany(userId, companyId, roleCode);
  }

  /**
   * 更新用户在企业中的角色
   * @param userId
   * @param companyId
   * @param newRoleCode
   */
  @UsePermission([Target.Admin])
  @Mutation(() => CompanyUser)
  updateUserRoleInCompany(
    @Args('userId') userId: string,
    @Args('companyId') companyId: string,
    @Args('newRoleCode') newRoleCode: string,
  ): Promise<CompanyUser> {
    return this.service.updateUserRoleInCompany(userId, companyId, newRoleCode);
  }

  /**
   * 从企业中移除用户
   * @param userId
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Mutation(() => Boolean)
  async removeUserFromCompany(
    @Args('userId') userId: string,
    @Args('companyId') companyId: string,
  ): Promise<boolean> {
    await this.service.removeUserFromCompany(userId, companyId);
    return true;
  }

  /**
   * 获取用户的完整信息
   * @param userId
   */
  @UsePermission([Target.Admin])
  @Query(() => String)
  async getUserFullInfo(@Args('userId') userId: string): Promise<string> {
    const info = await this.service.getUserFullInfo(userId);
    return JSON.stringify(info);
  }

  /**
   * 获取当前用户的完整信息
   * @param user
   */
  @UsePermission([Target.User])
  @Query(() => String)
  async getCurrentUserFullInfo(@CurrentAuthUser() user: User): Promise<string> {
    const info = await this.service.getUserFullInfo(user.id);
    return JSON.stringify(info);
  }

  /**
   * 获取用户在企业中的权限
   * @param userId
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Query(() => [String])
  getUserPermissionsInCompany(
    @Args('userId') userId: string,
    @Args('companyId') companyId: string,
  ): Promise<string[]> {
    return this.service.getUserPermissionsInCompany(userId, companyId);
  }

  /**
   * 检查用户在企业中是否有特定权限
   * @param userId
   * @param companyId
   * @param permission
   */
  @UsePermission([Target.Admin])
  @Query(() => Boolean)
  checkUserPermissionInCompany(
    @Args('userId') userId: string,
    @Args('companyId') companyId: string,
    @Args('permission') permission: string,
  ): Promise<boolean> {
    return this.service.checkUserPermissionInCompany(userId, companyId, permission);
  }

  /**
   * 获取用户所属的所有企业
   * @param userId
   */
  @UsePermission([Target.Admin])
  @Query(() => [CompanyUser])
  getUserCompanies(@Args('userId') userId: string): Promise<CompanyUser[]> {
    return this.service.getUserCompanies(userId);
  }

  /**
   * 获取当前用户所属的所有企业
   * @param user
   */
  @UsePermission([Target.User])
  @Query(() => [CompanyUser])
  getCurrentUserCompanies(@CurrentAuthUser() user: User): Promise<CompanyUser[]> {
    return this.service.getUserCompanies(user.id);
  }

  /**
   * 更新用户密码
   * @param user
   * @param oldPassword
   * @param newPassword
   */
  @UsePermission([Target.User])
  @Mutation(() => User)
  updateCurrentUserPassword(
    @CurrentAuthUser() user: User,
    @Args('oldPassword') oldPassword: string,
    @Args('newPassword') newPassword: string,
  ): Promise<User> {
    return this.service.updateUserPassword(user.id, oldPassword, newPassword);
  }

  /**
   * 重置用户密码（管理员操作）
   * @param userId
   * @param newPassword
   */
  @UsePermission([Target.Admin])
  @Mutation(() => User)
  resetUserPassword(
    @Args('userId') userId: string,
    @Args('newPassword') newPassword: string,
  ): Promise<User> {
    return this.service.resetUserPassword(userId, newPassword);
  }

  /**
   * 启用/禁用用户
   * @param userId
   * @param status
   */
  @UsePermission([Target.Admin])
  @Mutation(() => User)
  updateUserStatus(
    @Args('userId') userId: string,
    @Args('status') status: Status,
  ): Promise<User> {
    return this.service.updateUserStatus(userId, status);
  }

  /**
   * 批量更新用户状态
   * @param userIds
   * @param status
   */
  @UsePermission([Target.Admin])
  @Mutation(() => String)
  async batchUpdateUserStatus(
    @Args('userIds', { type: () => [String] }) userIds: string[],
    @Args('status') status: Status,
  ): Promise<string> {
    const result = await this.service.batchUpdateUserStatus(userIds, status);
    return JSON.stringify(result);
  }
}