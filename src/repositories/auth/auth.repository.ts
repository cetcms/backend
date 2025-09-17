import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { AuthCreateInput, FindManyAuthArgs, Target, UpsertOneAuthArgs } from 'src/generated/graphql';
import { AdminCompanyRepository, AdminRepository, CompanyUserRepository } from 'src/repositories';

import { AuthAbstract } from './auth.abstract';

/**
 * 认证数据访问仓库类
 *
 * 继承自AuthAbstract抽象类，实现了认证数据的具体访问方法
 */

@Injectable()
export class AuthRepository extends AuthAbstract {
  /**
   * 构造函数
   *
   * @param db - 数据库服务实例，用于执行数据库操作
   * @param admin
   * @param adminCompany
   * @param companyUser
   */
  constructor(
    protected readonly db: DatabaseService,
    private readonly admin: AdminRepository,
    private readonly adminCompany: AdminCompanyRepository,
    private readonly companyUser: CompanyUserRepository
  ) {
    super(db);
  }

  /**
   * 处理解析后的数据
   *
   * 实现抽象方法，主要用于处理解析后的数据
   *
   * @param input - 输入的创建或更新数据
   * @returns 处理后的数据
   */
  protected handleParsedData<T extends Prisma.AuthCreateInput | Prisma.AuthUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存认证记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的认证记录
   */
  save(where: UpsertOneAuthArgs['where'], data: UpsertOneAuthArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据ID查找认证记录
   *
   * @param id - 认证记录ID
   * @returns 查询到的认证记录信息
   */
  findOneById(id: string) {
    return this.findFirst({
      where: {
        id: {
          equals: id,
        },
      },
    });
  }

  /**
   * 根据用户ID查找认证信息
   *
   * @param userId - 用户ID
   * @returns 查询到的认证信息
   */
  findOneByUserId(userId: string) {
    return this.findFirst({
      where: {
        userId: {
          equals: userId,
        },
      },
    });
  }

  /**
   * 根据令牌查找认证信息
   *
   * @param token - 认证令牌
   * @returns 查询到的认证信息
   */
  findOneByToken(token: string) {
    return this.findFirst({
      where: {
        token: {
          equals: token,
        },
      },
    });
  }

  /**
   * 查询多个认证记录并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyAuthArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }

  /**
   * 根据目标类型创建身份认证记录
   * @param targetId - 目标唯一标识符
   * @param companyId - 公司唯一标识符（可选）
   * @param input - 创建身份认证记录所需的数据
   * @returns 创建的身份认证记录
   */
  createByTarget(targetId: string, companyId: string | null, input: AuthCreateInput) {
    switch (input.target) {
      case Target.Admin:
        return this.createOnlyAdmin(targetId, companyId, input);
      case Target.User:
        return this.createOnlyUser(targetId, companyId, input);
      default:
        throw new UnprocessableEntityException('target not supported');
    }
  }

  /**
   * 创建管理员认证记录
   * @param adminId 管理员 ID
   * @param companyId 公司 ID
   * @param data 创建认证记录输入数据
   * @returns 创建的认证记录
   */
  async createOnlyAdmin(adminId: string, companyId: string | null, data: AuthCreateInput) {
    data.target = Target.Admin;
    data.admin = { connect: { id: adminId } };
    if (companyId) {
      data.company = { connect: { id: companyId } };
      const admin = await this.admin.setInclude({ role: true }).findOneById(adminId);
      if (!admin) {
        throw new Error('target not found');
      }
      if (admin.role?.name !== 'ROOT') {
        const adminCompany = await this.adminCompany.findOneByUnique(adminId, companyId);
        if (!adminCompany) {
          throw new Error('you cannot manage the company');
        }
      }
    } else {
      delete data.company;
    }
    delete data.user;
    return this.create(data);
  }

  /**
   * 创建用户认证记录
   * @param userId 用户 ID
   * @param companyId 公司 ID
   * @param data 创建认证记录输入数据
   * @returns 创建的认证记录
   */
  async createOnlyUser(userId: string, companyId: string | null, data: AuthCreateInput) {
    data.target = Target.User;
    data.user = { connect: { id: userId } };
    if (companyId) {
      data.company = { connect: { id: companyId } };
      const companyUser = await this.companyUser.findOneByUnique(userId, companyId);
      if (!companyUser) {
        throw new Error('you cannot manage the company');
      }
    } else {
      delete data.company;
    }
    return this.create(data);
  }

  /**
   * 删除所有与用户相关的身份认证记录
   * 根据用户 ID 删除该用户的所有身份认证记录
   * @param userId - 用户唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByUserId(userId: string) {
    return this.deleteMany({ userId: { equals: userId } });
  }

  /**
   * 根据管理员 ID 删除该管理员的所有身份认证记录
   * @param adminId - 管理员唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByAdminId(adminId: string) {
    return this.deleteMany({ adminId: { equals: adminId } });
  }

  /**
   * 根据公司 ID 删除该公司的所有身份认证记录
   * @param companyId - 公司唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByCompanyId(companyId: string) {
    return this.deleteMany({ companyId: { equals: companyId } });
  }

  /**
   * 根据目标类型删除身份认证记录
   * @param target
   * @param targetId - 目标唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteByTarget(target: Target, targetId: string) {
    switch (target) {
      case Target.Admin:
        return this.deleteAllByAdminId(targetId);
      case Target.User:
        return this.deleteAllByUserId(targetId);
      default:
        throw new UnprocessableEntityException('target not supported');
    }
  }

  /**
   * 根据认证记录 ID 删除身份认证记录
   * @param id - 认证记录唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteById(id: string) {
    return this.delete({ id });
  }
}
