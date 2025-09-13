import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  Auth,
  AuthWhereInput,
  AuthCreateInput,
  AuthUpdateInput,
  AuthWhereUniqueInput,
  AuthOrderByWithRelationInput,
} from 'src/generated/graphql/auth';
import { Target } from 'src/generated/graphql/prisma';
import {
  AuthCreateInputObjectZodSchema,
  AuthUpdateInputObjectSchema,
  AuthWhereInputObjectSchema,
  AuthWhereUniqueInputObjectSchema,
} from 'src/generated/schemas';
import { AdminCompanyRepository, AdminRepository, CompanyUserRepository } from 'src/repositories';

type PickWhereUniqueFields = 'id';

/**
 * 身份认证数据访问层
 * 提供对身份认证令牌的完整 CRUD 操作
 *
 * @description 该仓库类封装了所有与身份认证相关的数据库操作，
 * 包括查询、创建、更新、删除等功能，并提供了分页查询和批量操作的支持。
 * 支持按用户、管理员、公司、令牌等多维度查询和管理。
 */
@Injectable()
export class AuthRepository {
  constructor(
    private readonly db: DatabaseService,
    private readonly admin: AdminRepository,
    private readonly adminCompany: AdminCompanyRepository,
    private readonly companyUser: CompanyUserRepository
  ) {}

  /** 关联查询配置，用于指定查询时需要包含的关联数据 */
  private include: Prisma.AuthInclude = {};

  /**
   * 设置关联查询配置
   * @param include - Prisma 关联查询配置对象
   */
  setInclude(include: Prisma.AuthInclude) {
    this.include = include;
    return this;
  }

  /**
   * 处理输入数据
   * @param input - 输入数据
   */
  private handleInputData(input: AuthCreateInput | AuthUpdateInput) {
    // 此repository暂时不需要特殊处理输入数据
    return input;
  }

  /**
   * 解析创建数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 创建身份认证的输入数据
   * @returns 解析后的创建数据
   */
  private parseCreateData(input: AuthCreateInput) {
    return AuthCreateInputObjectZodSchema.parse(input) as unknown as Prisma.AuthCreateInput;
  }

  /**
   * 解析更新数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 更新身份认证的输入数据
   * @returns 解析后的更新数据
   */
  private parseUpdateData(input: AuthUpdateInput) {
    return AuthUpdateInputObjectSchema.parse(input) as unknown as Prisma.AuthUpdateInput;
  }

  /**
   * 解析查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 查询条件
   * @returns 解析后的查询条件
   */
  private parseManyWhere(where: AuthWhereInput) {
    return AuthWhereInputObjectSchema.parse(where) as unknown as Prisma.AuthWhereInput;
  }

  /**
   * 解析唯一查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 唯一查询条件
   * @returns 解析后的唯一查询条件
   */
  private parseUniqueWhere(where: AuthWhereUniqueInput) {
    return AuthWhereUniqueInputObjectSchema.parse(where) as unknown as Prisma.AuthWhereUniqueInput;
  }

  /**
   * 根据令牌查找身份认证记录
   * @param token - 身份认证令牌
   * @returns 匹配的身份认证记录或 null
   */
  findByToken(token: string) {
    return this.findFirst({ token: { equals: token } });
  }

  /**
   * 根据用户 ID 查找所有身份认证记录
   * @param userId - 用户唯一标识符
   * @returns 该用户的所有身份认证记录列表
   */
  findByUserId(userId: string) {
    return this.findMany({ userId: { equals: userId } });
  }

  /**
   * 根据管理员 ID 查找所有身份认证记录
   * @param adminId - 管理员唯一标识符
   * @returns 该管理员的所有身份认证记录列表
   */
  findByAdminId(adminId: string) {
    return this.findMany({ adminId: { equals: adminId } });
  }

  /**
   * 根据公司 ID 查找所有身份认证记录
   * @param companyId - 公司唯一标识符
   * @returns 该公司的所有身份认证记录列表
   */
  findByCompanyId(companyId: string) {
    return this.findMany({ companyId: { equals: companyId } });
  }

  /**
   * 根据身份认证 ID 查找记录
   * @param id - 身份认证唯一标识符
   * @returns 匹配的身份认证记录或 null
   */
  findById(id: string) {
    return this.findUnique({ id });
  }

  /**
   * 查找已过期的身份认证记录
   * @param beforeDate - 截止日期（默认为当前时间）
   * @returns 已过期的身份认证记录列表
   */
  findExpired(beforeDate: Date = new Date()) {
    return this.findMany({ expiredAt: { lt: beforeDate } });
  }

  /**
   * 根据身份认证 ID 更新记录
   * @param id - 身份认证唯一标识符
   * @param input - 更新数据
   * @returns 更新后的身份认证记录
   */
  updateById(id: string, input: AuthUpdateInput) {
    return this.update({ id }, input);
  }

  /**
   * 分页查询身份认证记录
   * @param skip - 跳过的记录数量（默认为 0）
   * @param take - 获取的记录数量（默认为 10）
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 包含总数和身份认证记录列表的数组 [总数, 记录列表]
   */
  findWithPagination(
    skip: number = 0,
    take: number = 10,
    where?: AuthWhereInput,
    orderBy?: AuthOrderByWithRelationInput
  ) {
    return Promise.all([this.count(where), this.findMany(where, orderBy, skip, take)]);
  }

  /**
   * 查找第一个匹配的身份认证记录
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 第一个匹配的身份认证记录或 null
   */
  findFirst(where?: AuthWhereInput, orderBy?: AuthOrderByWithRelationInput): Promise<Auth | null> {
    const args: Prisma.AuthFindFirstArgs = { include: this.include, orderBy };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.auth.findFirst(args);
  }

  /**
   * 根据唯一条件查找身份认证记录
   * @param where - 唯一查询条件（只能使用 id）
   * @returns 匹配的身份认证记录或 null
   */
  findUnique(where: Pick<AuthWhereUniqueInput, PickWhereUniqueFields>): Promise<Auth | null> {
    return this.db.auth.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.include,
    });
  }

  /**
   * 查询多个身份认证记录
   * @param where - 查询条件（可选）
   * @param orderBy - 排序条件（可选）
   * @param skip - 跳过的记录数量（可选）
   * @param take - 获取的记录数量（可选）
   * @returns 符合条件的身份认证记录列表
   */
  findMany(
    where?: AuthWhereInput,
    orderBy?: AuthOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<Auth[]> {
    const args: Prisma.AuthFindManyArgs = {
      include: this.include,
      orderBy,
      skip,
      take,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.auth.findMany(args);
  }

  /**
   * 统计符合条件的身份认证记录数量
   * @param where - 查询条件（可选）
   * @returns 符合条件的记录总数
   */
  count(where?: AuthWhereInput): Promise<number> {
    const args: Prisma.AuthCountArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.auth.count(args);
  }

  /**
   * 更新身份认证记录
   * @param where - 唯一查询条件（只能使用 id）
   * @param input - 更新数据
   * @returns 更新后的身份认证记录
   */
  update(where: Pick<AuthWhereUniqueInput, PickWhereUniqueFields>, input: AuthUpdateInput): Promise<Auth> {
    this.handleInputData(input);
    return this.db.auth.update({
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(input),
    });
  }

  /**
   * 创建新的身份认证记录
   * @param input - 创建身份认证记录所需的数据
   * @returns 创建的身份认证记录
   */
  create(input: AuthCreateInput): Promise<Auth> {
    this.handleInputData(input);
    return this.db.auth.create({
      data: this.parseCreateData(input),
    });
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
        if (!companyId) {
          throw new UnprocessableEntityException('you cannot auth without company');
        }
        return this.createOnlyUser(targetId, companyId, input);
      default:
        throw new UnprocessableEntityException('target not supported');
    }
  }

  /**
   * 创建管理员认证记录
   * @param adminId 管理员 ID
   * @param companyId 公司 ID
   * @param input 创建认证记录输入数据
   * @returns 创建的认证记录
   */
  async createOnlyAdmin(adminId: string, companyId: string | null, input: AuthCreateInput) {
    input.target = Target.Admin;
    input.admin = { connect: { id: adminId } };
    if (companyId) {
      input.company = { connect: { id: companyId } };
      const admin = await this.admin.setInclude({ role: true }).findById(adminId);
      if (!admin) {
        throw new Error('target not found');
      }
      if (admin.role?.name !== 'ROOT') {
        const adminCompany = await this.adminCompany.findUnique({
          adminCompanyIdx: {
            adminId,
            companyId,
          },
        });
        if (!adminCompany) {
          throw new Error('you cannot manage the company');
        }
      }
    } else {
      delete input.company;
    }
    delete input.user;
    return this.create(input);
  }

  /**
   * 创建用户认证记录
   * @param userId 用户 ID
   * @param companyId 公司 ID
   * @param input 创建认证记录输入数据
   * @returns 创建的认证记录
   */
  async createOnlyUser(userId: string, companyId: string, input: AuthCreateInput) {
    input.target = Target.User;
    input.user = { connect: { id: userId } };
    input.company = { connect: { id: companyId } };
    const companyUser = await this.companyUser.findUnique({
      companyUserIdx: {
        userId,
        companyId,
      },
    });
    if (!companyUser) {
      throw new Error('you cannot manage the company');
    }

    return this.create(input);
  }

  /**
   * 创建或更新身份认证记录（如果存在则更新，不存在则创建）
   * @param where - 唯一查询条件
   * @param input - 创建/更新数据
   * @returns 创建或更新后的身份认证记录
   */
  upsert(where: Pick<AuthWhereUniqueInput, PickWhereUniqueFields>, input: AuthCreateInput): Promise<Auth> {
    this.handleInputData(input);
    const data = this.parseCreateData(input);
    return this.db.auth.upsert({
      where: this.parseUniqueWhere(where),
      update: data,
      create: data,
    });
  }

  /**
   * 删除身份认证记录
   * @param where - 唯一查询条件（只能使用 id）
   * @returns 删除的身份认证记录
   */
  delete(where: Pick<AuthWhereUniqueInput, PickWhereUniqueFields>): Promise<Auth> {
    return this.db.auth.delete({
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除身份认证记录
   * @param where - 查询条件（可选，不指定则删除所有记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteMany(where?: AuthWhereInput) {
    const args: Prisma.AuthDeleteManyArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.auth.deleteMany(args);
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
   * 清理已过期的身份认证记录
   * @param beforeDate - 截止日期（默认为当前时间）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteExpired(beforeDate: Date = new Date()) {
    return this.deleteMany({ expiredAt: { lt: beforeDate } });
  }
}
