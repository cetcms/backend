import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuthCompany, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { Company, CompanyUser, Target } from 'src/generated/graphql';

import { CompanyManagementService } from '../services';

/**
 * 企业管理综合解析器
 * @module CompanyManagement
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class CompanyManagementResolver {
  constructor(private readonly service: CompanyManagementService) {}

  /**
   * 创建企业并初始化默认角色
   * @param companyData
   * @param adminUserId
   */
  @UsePermission([Target.Admin])
  @Mutation(() => Company)
  async createCompanyWithDefaults(
    @Args('companyData') companyData: any,
    @Args('adminUserId', { nullable: true }) adminUserId?: string
  ) {
    const result = await this.service.createCompanyWithDefaults(companyData, adminUserId);
    return result.company;
  }

  /**
   * 为企业添加用户
   * @param companyId
   * @param userId
   * @param roleCode
   */
  @UsePermission([Target.Admin])
  @Mutation(() => CompanyUser)
  addUserToCompany(
    @Args('companyId') companyId: string,
    @Args('userId') userId: string,
    @Args('roleCode', { defaultValue: 'user' }) roleCode: string
  ): Promise<CompanyUser> {
    return this.service.addUserToCompany(companyId, userId, roleCode);
  }

  /**
   * 更新用户在企业中的角色
   * @param companyId
   * @param userId
   * @param newRoleCode
   */
  @UsePermission([Target.Admin])
  @Mutation(() => CompanyUser)
  updateUserRole(
    @Args('companyId') companyId: string,
    @Args('userId') userId: string,
    @Args('newRoleCode') newRoleCode: string
  ): Promise<CompanyUser> {
    return this.service.updateUserRole(companyId, userId, newRoleCode);
  }

  /**
   * 从企业中移除用户
   * @param companyId
   * @param userId
   */
  @UsePermission([Target.Admin])
  @Mutation(() => Boolean)
  async removeUserFromCompany(@Args('companyId') companyId: string, @Args('userId') userId: string): Promise<boolean> {
    await this.service.removeUserFromCompany(companyId, userId);
    return true;
  }

  /**
   * 获取企业的完整信息
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Query(() => String)
  async getCompanyFullInfo(@Args('companyId') companyId: string): Promise<string> {
    const info = await this.service.getCompanyFullInfo(companyId);
    return JSON.stringify(info);
  }

  /**
   * 获取当前企业的完整信息
   * @param company
   */
  @UsePermission([Target.Admin, Target.User])
  @Query(() => String)
  async getCurrentCompanyFullInfo(@CurrentAuthCompany() company: Company): Promise<string> {
    const info = await this.service.getCompanyFullInfo(company.id);
    return JSON.stringify(info);
  }

  /**
   * 获取用户的企业权限
   * @param userId
   * @param companyId
   */
  @UsePermission([Target.Admin])
  @Query(() => [String])
  getUserCompanyPermissions(@Args('userId') userId: string, @Args('companyId') companyId: string): Promise<string[]> {
    return this.service.getUserCompanyPermissions(userId, companyId);
  }

  /**
   * 检查用户是否有特定权限
   * @param userId
   * @param companyId
   * @param permission
   */
  @UsePermission([Target.Admin])
  @Query(() => Boolean)
  checkUserPermission(
    @Args('userId') userId: string,
    @Args('companyId') companyId: string,
    @Args('permission') permission: string
  ): Promise<boolean> {
    return this.service.checkUserPermission(userId, companyId, permission);
  }
}
