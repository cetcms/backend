import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminRepository, AdminRoleRepository, AdminCompanyRepository } from 'src/repositories';

import { AdminService } from './admin.service';

/**
 * 管理员管理综合服务
 *
 * 提供管理员、角色、企业分配的综合管理功能
 */
@Injectable()
export class AdminManagementService {
  constructor(
    private readonly adminService: AdminService,
    private readonly admin: AdminRepository,
    private readonly adminRole: AdminRoleRepository,
    private readonly adminCompany: AdminCompanyRepository
  ) {}

  /**
   * 创建管理员并分配默认角色
   * @param adminData 管理员数据
   * @param roleId 角色ID（可选）
   */
  async createAdminWithDefaults(adminData: any, roleId?: string) {
    // 创建管理员
    const admin = await this.admin.create(adminData);

    // 如果提供了角色ID，则分配角色
    if (roleId) {
      const role = await this.adminRole.findOneById(roleId);
      if (!role) {
        throw new NotFoundException('角色不存在');
      }

      // 更新管理员的角色
      await this.admin.update({ id: admin.id }, { role: { connect: { id: roleId } } });
    }

    return admin;
  }

  /**
   * 为管理员分配企业
   * @param adminId 管理员ID
   * @param companyId 企业ID
   * @param permissions 权限列表
   */
  async assignCompanyToAdmin(adminId: string, companyId: string, permissions: string[] = []) {
    // 验证管理员是否存在
    await this.adminService.findOneById(adminId);

    // 检查管理员是否已经分配到该企业
    const existingRelation = await this.adminCompany.findOneByUnique(adminId, companyId);
    if (existingRelation) {
      throw new BadRequestException('管理员已经分配到该企业');
    }

    // 创建管理员企业关联
    return this.adminCompany.create({
      admin: { connect: { id: adminId } },
      company: { connect: { id: companyId } },
      permissions,
    });
  }

  /**
   * 更新管理员在企业中的权限
   * @param adminId 管理员ID
   * @param companyId 企业ID
   * @param permissions 新权限列表
   */
  async updateAdminCompanyPermissions(adminId: string, companyId: string, permissions: string[]) {
    // 查找管理员企业关联
    const relation = await this.adminCompany.findOneByUnique(adminId, companyId);
    if (!relation) {
      throw new NotFoundException('管理员未分配到该企业');
    }

    // 更新权限
    return this.adminCompany.update({ adminCompanyIdx: { adminId, companyId } }, { permissions });
  }

  /**
   * 从企业中移除管理员
   * @param adminId 管理员ID
   * @param companyId 企业ID
   */
  async removeAdminFromCompany(adminId: string, companyId: string) {
    const relation = await this.adminCompany.findOneByUnique(adminId, companyId);
    if (!relation) {
      throw new NotFoundException('管理员未分配到该企业');
    }

    return this.adminCompany.deleteByUnique(adminId, companyId);
  }

  /**
   * 获取管理员的完整信息（包括角色和企业分配）
   * @param adminId 管理员ID
   */
  async getAdminFullInfo(adminId: string) {
    const admin = await this.adminService.findOneById(adminId);
    const companies = await this.adminCompany.findManyByAdminId(adminId);

    return {
      admin,
      companies,
      statistics: {
        totalCompanies: companies.length,
        activeCompanies: companies.length, // 所有关联的企业都视为活跃
      },
    };
  }

  /**
   * 获取管理员在企业中的权限
   * @param adminId 管理员ID
   * @param companyId 企业ID
   */
  async getAdminCompanyPermissions(adminId: string, companyId: string) {
    const relation = await this.adminCompany.findOneByUnique(adminId, companyId);
    if (!relation) {
      return [];
    }

    return relation.permissions || [];
  }

  /**
   * 检查管理员是否有特定权限
   * @param adminId 管理员ID
   * @param companyId 企业ID
   * @param permission 权限
   */
  async checkAdminPermission(adminId: string, companyId: string, permission: string): Promise<boolean> {
    const permissions = await this.getAdminCompanyPermissions(adminId, companyId);

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
   * 批量分配企业给管理员
   * @param adminId 管理员ID
   * @param companyIds 企业ID列表
   * @param permissions 权限列表
   */
  async batchAssignCompaniesToAdmin(adminId: string, companyIds: string[], permissions: string[] = []) {
    // 验证管理员是否存在
    await this.adminService.findOneById(adminId);

    const results: Array<{ companyId: string; success: boolean; result?: any; error?: string }> = [];
    for (const companyId of companyIds) {
      try {
        const result = await this.assignCompanyToAdmin(adminId, companyId, permissions);
        results.push({ companyId, success: true, result });
      } catch (error: any) {
        results.push({ companyId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * 获取企业的管理员列表
   * @param companyId 企业ID
   */
  getCompanyAdmins(companyId: string) {
    return this.adminCompany.findManyByCompanyId(companyId);
  }

  /**
   * 更新管理员角色
   * @param adminId 管理员ID
   * @param roleId 新角色ID
   */
  async updateAdminRole(adminId: string, roleId: string) {
    // 验证角色是否存在
    const role = await this.adminRole.findOneById(roleId);
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 更新管理员角色
    return this.admin.update({ id: adminId }, { role: { connect: { id: roleId } } });
  }

  /**
   * 获取管理员的角色信息
   * @param adminId 管理员ID
   */
  async getAdminRole(adminId: string) {
    const admin = await this.admin.findUnique({ id: adminId });
    if (!admin || !admin.roleId) {
      return null;
    }

    return this.adminRole.findOneById(admin.roleId);
  }
}
