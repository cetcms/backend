import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { Admin, AdminCompany, Target } from 'src/generated/graphql';

import { AdminManagementService } from '../services';

/**
 * 管理员管理综合解析器
 * @module AdminManagement
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class AdminManagementResolver {
  constructor(private readonly service: AdminManagementService) {}

  /**
   * 创建管理员并分配默认角色
   * @param adminData
   * @param roleId
   */
  @UsePermission([Target.Admin])
  @Mutation(() => Admin)
  createAdminWithDefaults(@Args('adminData') adminData: any, @Args('roleId', { nullable: true }) roleId?: string) {
    return this.service.createAdminWithDefaults(adminData, roleId);
  }

  /**
   * 为管理员分配企业
   * @param adminId
   * @param companyId
   * @param permissions
   */
  @UsePermission([Target.Admin])
  @Mutation(() => AdminCompany)
  assignCompanyToAdmin(
    @Args('adminId') adminId: string,
    @Args('companyId') companyId: string,
    @Args('permissions', { type: () => [String], defaultValue: [] }) permissions: string[]
  ): Promise<AdminCompany> {
    return this.service.assignCompanyToAdmin(adminId, companyId, permissions);
  }

  /**
   * 更新管理员在企业中的权限
   * @param adminId
   * @param companyId
   * @param permissions
   */
  @UsePermission([Target.Admin])
  @Mutation(() => AdminCompany)
  updateAdminCompanyPermissions(
    @Args('adminId') adminId: string,
    @Args('companyId') companyId: string,
    @Args('permissions', { type: () => [String] }) permissions: string[]
  ): Promise<AdminCompany> {
    return this.service.updateAdminCompanyPermissions(adminId, companyId, permissions);
  }

  /**
   * 从企业中移除管理员
   * @param adminId
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Mutation(() => Boolean)
  async removeAdminFromCompany(
    @Args('adminId') adminId: string,
    @Args('companyId') companyId: string
  ): Promise<boolean> {
    await this.service.removeAdminFromCompany(adminId, companyId);
    return true;
  }

  /**
   * 获取管理员在企业中的权限
   * @param adminId
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Query(() => [String])
  getAdminCompanyPermissions(
    @Args('adminId') adminId: string,
    @Args('companyId') companyId: string
  ): Promise<string[]> {
    return this.service.getAdminCompanyPermissions(adminId, companyId);
  }

  /**
   * 检查管理员是否有特定权限
   * @param adminId
   * @param companyId
   * @param permission
   */
  @UsePermission([Target.Admin])
  @Query(() => Boolean)
  checkAdminPermission(
    @Args('adminId') adminId: string,
    @Args('companyId') companyId: string,
    @Args('permission') permission: string
  ): Promise<boolean> {
    return this.service.checkAdminPermission(adminId, companyId, permission);
  }

  /**
   * 批量分配企业给管理员
   * @param adminId
   * @param companyIds
   * @param permissions
   */
  @UsePermission([Target.Admin])
  @Mutation(() => Boolean)
  async batchAssignCompaniesToAdmin(
    @Args('adminId') adminId: string,
    @Args('companyIds', { type: () => [String] }) companyIds: string[],
    @Args('permissions', { type: () => [String], defaultValue: [] }) permissions: string[]
  ): Promise<boolean> {
    await this.service.batchAssignCompaniesToAdmin(adminId, companyIds, permissions);
    return true;
  }

  /**
   * 获取企业的管理员列表
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Query(() => [AdminCompany])
  getCompanyAdmins(@Args('companyId') companyId: string): Promise<AdminCompany[]> {
    return this.service.getCompanyAdmins(companyId);
  }

  /**
   * 更新管理员角色
   * @param adminId
   * @param roleId
   */
  @UsePermission([Target.Admin])
  @Mutation(() => Admin)
  updateAdminRole(@Args('adminId') adminId: string, @Args('roleId') roleId: string): Promise<Admin> {
    return this.service.updateAdminRole(adminId, roleId);
  }

  /**
   * 获取管理员的角色信息
   * @param adminId
   */
  @UsePermission([Target.Admin])
  @Query(() => String, { nullable: true })
  async getAdminRole(@Args('adminId') adminId: string): Promise<string | null> {
    const role = await this.service.getAdminRole(adminId);
    return role ? JSON.stringify(role) : null;
  }
}
