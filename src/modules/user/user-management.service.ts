import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { Status } from 'src/generated/graphql';
import { UserRepository, CompanyUserRepository, CompanyRoleRepository } from 'src/repositories';

import { UserService } from './user.service';

/**
 * 用户管理综合服务
 *
 * 提供用户、企业关联、角色分配的综合管理功能
 */
@Injectable()
export class UserManagementService {
  constructor(
    private readonly userService: UserService,
    private readonly user: UserRepository,
    private readonly companyUser: CompanyUserRepository,
    private readonly companyRole: CompanyRoleRepository
  ) {}

  /**
   * 创建用户并分配到企业
   * @param userData 用户数据
   * @param companyId 企业ID（可选）
   * @param roleCode 角色代码（默认为user）
   */
  async createUserWithCompany(userData: any, companyId?: string, roleCode: string = 'user') {
    // 检查邮箱是否已存在
    const existingUser = await this.user.findOneByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('邮箱已被使用');
    }

    // 创建用户
    const user = await this.user.create(userData);

    // 如果指定了企业，则创建用户企业关联
    if (companyId) {
      const role = await this.companyRole.findOneByUnique(roleCode, companyId);
      if (!role) {
        throw new NotFoundException(`角色 ${roleCode} 不存在`);
      }

      await this.companyUser.create({
        user: { connect: { id: user.id } },
        company: { connect: { id: companyId } },
        role: { connect: { id: role.id } },
        status: Status.Enabled,
      });
    }

    return user;
  }

  /**
   * 将用户添加到企业
   * @param userId 用户ID
   * @param companyId 企业ID
   * @param roleCode 角色代码
   */
  async addUserToCompany(userId: string, companyId: string, roleCode: string = 'user') {
    // 验证用户是否存在
    await this.userService.findOneById(userId);

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
   * @param userId 用户ID
   * @param companyId 企业ID
   * @param newRoleCode 新角色代码
   */
  async updateUserRoleInCompany(userId: string, companyId: string, newRoleCode: string) {
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
   * @param userId 用户ID
   * @param companyId 企业ID
   */
  async removeUserFromCompany(userId: string, companyId: string) {
    const relation = await this.companyUser.findOneByUnique(userId, companyId);
    if (!relation) {
      throw new NotFoundException('用户不在该企业中');
    }

    return this.companyUser.delete({
      companyUserIdx: { userId, companyId },
    });
  }

  /**
   * 获取用户的完整信息（包括企业关联）
   * @param userId 用户ID
   */
  async getUserFullInfo(userId: string) {
    const user = await this.userService.findOneById(userId);
    const companyRelations = await this.companyUser.findManyByUserId(userId);

    return {
      user,
      companies: companyRelations,
      statistics: {
        totalCompanies: companyRelations.length,
        activeCompanies: companyRelations.filter((c) => c.status === Status.Enabled).length,
      },
    };
  }

  /**
   * 获取用户在特定企业的权限
   * @param userId 用户ID
   * @param companyId 企业ID
   */
  async getUserPermissionsInCompany(userId: string, companyId: string) {
    const relation = await this.companyUser.findOneByUnique(userId, companyId);
    if (!relation) {
      return [];
    }

    const role = await this.companyRole.findOneById(relation.roleId);
    return role?.permissions || [];
  }

  /**
   * 检查用户在企业中是否有特定权限
   * @param userId 用户ID
   * @param companyId 企业ID
   * @param permission 权限
   */
  async checkUserPermissionInCompany(userId: string, companyId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissionsInCompany(userId, companyId);

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
    if (permissions.includes(`${module}:*`)) {
      return true;
    }

    return false;
  }

  /**
   * 获取用户所属的所有企业
   * @param userId 用户ID
   */
  getUserCompanies(userId: string) {
    return this.companyUser.findManyByUserId(userId);
  }

  /**
   * 更新用户密码
   * @param userId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async updateUserPassword(userId: string, oldPassword: string, newPassword: string) {
    // 验证旧密码
    const user = await this.user.findByIdAndCheckPassword(userId, oldPassword);
    if (!user) {
      throw new BadRequestException('旧密码错误');
    }

    // 更新密码
    return this.user.update({ id: userId }, { password: newPassword });
  }

  /**
   * 重置用户密码（管理员操作）
   * @param userId 用户ID
   * @param newPassword 新密码
   */
  async resetUserPassword(userId: string, newPassword: string) {
    // 验证用户是否存在
    await this.userService.findOneById(userId);

    // 重置密码
    return this.user.update({ id: userId }, { password: newPassword });
  }

  /**
   * 启用/禁用用户
   * @param userId 用户ID
   * @param status 状态
   */
  async updateUserStatus(userId: string, status: Status) {
    // 验证用户是否存在
    await this.userService.findOneById(userId);

    // 更新状态
    return this.user.update({ id: userId }, { status });
  }

  /**
   * 批量操作用户状态
   * @param userIds 用户ID列表
   * @param status 状态
   */
  async batchUpdateUserStatus(userIds: string[], status: Status) {
    const results = await Promise.allSettled(userIds.map((userId) => this.updateUserStatus(userId, status)));

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      successful,
      failed,
      total: userIds.length,
    };
  }
}
