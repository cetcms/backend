import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Status } from 'src/generated/graphql';
import { CompanyRepository, CompanyRoleRepository, CompanyUserRepository } from 'src/repositories';

import { CompanyService } from './company.service';

/**
 * 企业管理综合服务
 *
 * 提供企业、角色、用户的综合管理功能
 */
@Injectable()
export class CompanyManagementService {
  constructor(
    private readonly companyService: CompanyService,
    private readonly company: CompanyRepository,
    private readonly companyRole: CompanyRoleRepository,
    private readonly companyUser: CompanyUserRepository
  ) {}

  /**
   * 创建企业并初始化默认角色
   * @param companyData 企业数据
   * @param adminUserId 管理员用户ID
   */
  async createCompanyWithDefaults(companyData: any, adminUserId?: string) {
    // 创建企业
    const company = await this.company.create(companyData);

    // 创建默认角色
    const defaultRoles = [
      {
        name: '超级管理员',
        code: 'super_admin',
        description: '企业超级管理员，拥有所有权限',
        permissions: ['*'],
        companyId: company.id,
        status: Status.Enabled,
      },
      {
        name: '管理员',
        code: 'admin',
        description: '企业管理员',
        permissions: ['company:read', 'company:update', 'user:*', 'role:*'],
        companyId: company.id,
        status: Status.Enabled,
      },
      {
        name: '普通用户',
        code: 'user',
        description: '企业普通用户',
        permissions: ['company:read', 'user:read'],
        companyId: company.id,
        status: Status.Enabled,
      },
    ];

    const createdRoles = await Promise.all(defaultRoles.map((roleData) => this.companyRole.create(roleData)));

    // 如果提供了管理员用户ID，则创建用户关联
    if (adminUserId) {
      const superAdminRole = createdRoles.find((role) => role.code === 'super_admin');
      if (superAdminRole) {
        await this.companyUser.create({
          user: { connect: { id: adminUserId } },
          company: { connect: { id: company.id } },
          role: { connect: { id: superAdminRole.id } },
          status: Status.Enabled,
        });
      }
    }

    return {
      company,
      roles: createdRoles,
    };
  }

  /**
   * 为企业添加用户
   * @param companyId 企业ID
   * @param userId 用户ID
   * @param roleCode 角色代码
   */
  async addUserToCompany(companyId: string, userId: string, roleCode: string = 'user') {
    // 验证企业是否存在
    await this.companyService.findOneById(companyId);

    // 查找角色
    const role = await this.companyRole.findOneByUnique(roleCode, companyId);
    if (!role) {
      throw new NotFoundException(`角色 ${roleCode} 不存在`);
    }

    // 检查用户是否已经在企业中
    const existingRelation = await this.companyUser.findOneByUnique(userId, companyId);
    if (existingRelation) {
      throw new BadRequestException('用户已经在该企业中');
    }

    // 创建用户企业关联
    return this.companyUser.create({
      user: { connect: { id: userId } },
      company: { connect: { id: companyId } },
      role: { connect: { id: role.id } },
      status: Status.Enabled,
    });
  }

  /**
   * 更新用户在企业中的角色
   * @param companyId 企业ID
   * @param userId 用户ID
   * @param newRoleCode 新角色代码
   */
  async updateUserRole(companyId: string, userId: string, newRoleCode: string) {
    // 查找新角色
    const newRole = await this.companyRole.findOneByUnique(newRoleCode, companyId);
    if (!newRole) {
      throw new NotFoundException(`角色 ${newRoleCode} 不存在`);
    }

    // 查找用户企业关联
    const relation = await this.companyUser.findOneByUnique(userId, companyId);
    if (!relation) {
      throw new NotFoundException('用户不在该企业中');
    }

    // 更新角色
    return this.companyUser.update(
      { companyUserIdx: { userId, companyId } },
      { role: { connect: { id: newRole.id } } }
    );
  }

  /**
   * 从企业中移除用户
   * @param companyId 企业ID
   * @param userId 用户ID
   */
  async removeUserFromCompany(companyId: string, userId: string) {
    const relation = await this.companyUser.findOneByUnique(userId, companyId);
    if (!relation) {
      throw new NotFoundException('用户不在该企业中');
    }

    return this.companyUser.delete({
      companyUserIdx: { userId, companyId },
    });
  }

  /**
   * 获取企业的完整信息（包括角色和用户）
   * @param companyId 企业ID
   */
  async getCompanyFullInfo(companyId: string) {
    const company = await this.companyService.findOneById(companyId);
    const roles = await this.companyRole.findByCompanyId(companyId);
    const users = await this.companyUser.findManyByCompanyId(companyId);

    return {
      company,
      roles,
      users,
      statistics: {
        totalRoles: roles.length,
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.status === Status.Enabled).length,
      },
    };
  }

  /**
   * 获取用户的企业权限
   * @param userId 用户ID
   * @param companyId 企业ID
   */
  async getUserCompanyPermissions(userId: string, companyId: string) {
    const relation = await this.companyUser.findOneByUnique(userId, companyId);
    if (!relation) {
      return [];
    }

    const role = await this.companyRole.findOneById(relation.roleId);
    return role?.permissions || [];
  }

  /**
   * 检查用户是否有特定权限
   * @param userId 用户ID
   * @param companyId 企业ID
   * @param permission 权限
   */
  async checkUserPermission(userId: string, companyId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserCompanyPermissions(userId, companyId);

    // 检查是否有通配符权限
    if (permissions.includes('*')) {
      return true;
    }

    // 检查精确匹配
    if (permissions.includes(permission)) {
      return true;
    }

    // 检查模块级通配符权限
    const [module] = permission.split(':');
    return !!permissions.includes(`${module}:*`);
  }
}
