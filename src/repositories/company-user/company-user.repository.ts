import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  CompanyUser,
  CompanyUserWhereInput,
  CompanyUserCreateInput,
  CompanyUserUpdateInput,
  CompanyUserWhereUniqueInput,
  CompanyUserOrderByWithRelationInput,
} from 'src/generated/graphql/company-user';
import {
  CompanyUserCreateInputObjectZodSchema,
  CompanyUserUpdateInputObjectSchema,
  CompanyUserWhereInputObjectSchema,
  CompanyUserWhereUniqueInputObjectSchema,
} from 'src/generated/schemas';

type PickWhereUniqueFields = 'companyUserIdx';

/**
 * 公司用户关联数据访问层
 * 提供对公司与用户关联关系的完整 CRUD 操作
 *
 * @description 该仓库类封装了所有与公司用户关联相关的数据库操作，
 * 包括查询、创建、更新、删除等功能，并提供了分页查询和批量操作的支持。
 * 利用了 companyId 和 userId 的复合唯一约束特性进行优化查询。
 */
@Injectable()
export class CompanyUserRepository {
  constructor(private readonly db: DatabaseService) {}

  /** 关联查询配置，用于指定查询时需要包含的关联数据 */
  private include: Prisma.CompanyUserInclude = {};

  /**
   * 设置关联查询配置
   * @param include - Prisma 关联查询配置对象
   */
  setInclude(include: Prisma.CompanyUserInclude) {
    this.include = include;
    return this;
  }

  /**
   * 处理输入数据
   * @param input - 输入数据
   */
  private handleInputData(input: CompanyUserCreateInput | CompanyUserUpdateInput) {
    // 此repository暂时不需要特殊处理输入数据
    return input;
  }

  /**
   * 解析创建数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 创建公司用户的输入数据
   * @returns 解析后的创建数据
   */
  private parseCreateData(input: CompanyUserCreateInput) {
    return CompanyUserCreateInputObjectZodSchema.parse(input) as unknown as Prisma.CompanyUserCreateInput;
  }

  /**
   * 解析更新数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 更新公司用户的输入数据
   * @returns 解析后的更新数据
   */
  private parseUpdateData(input: CompanyUserUpdateInput) {
    return CompanyUserUpdateInputObjectSchema.parse(input) as unknown as Prisma.CompanyUserUpdateInput;
  }

  /**
   * 解析查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 查询条件
   * @returns 解析后的查询条件
   */
  private parseManyWhere(where: CompanyUserWhereInput) {
    return CompanyUserWhereInputObjectSchema.parse(where) as unknown as Prisma.CompanyUserWhereInput;
  }

  /**
   * 解析唯一查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 唯一查询条件
   * @returns 解析后的唯一查询条件
   */
  private parseUniqueWhere(where: CompanyUserWhereUniqueInput) {
    return CompanyUserWhereUniqueInputObjectSchema.parse(where) as unknown as Prisma.CompanyUserWhereUniqueInput;
  }

  /**
   * 根据公司 ID 查找所有关联的用户
   * @param companyId - 公司唯一标识符
   * @returns 该公司关联的所有用户记录列表
   */
  findByCompanyId(companyId: string) {
    return this.findMany({ companyId: { equals: companyId } });
  }

  /**
   * 根据用户 ID 查找所有关联的公司
   * @param userId - 用户唯一标识符
   * @returns 该用户关联的所有公司记录列表
   */
  findByUserId(userId: string) {
    return this.findMany({ userId: { equals: userId } });
  }

  /**
   * 根据角色 ID 查找所有关联的用户
   * @param roleId - 角色唯一标识符
   * @returns 该角色下的所有用户记录列表
   */
  findByRoleId(roleId: string) {
    return this.findMany({ roleId: { equals: roleId } });
  }

  /**
   * 根据公司 ID 和用户 ID 查找特定关联关系
   * @param companyId - 公司唯一标识符
   * @param userId - 用户唯一标识符
   * @returns 匹配的公司用户关联记录或 null
   */
  findByCompanyIdAndUserId(companyId: string, userId: string) {
    return this.findUnique({ companyUserIdx: { companyId, userId } });
  }

  /**
   * 根据公司 ID 和用户 ID 更新关联关系
   * @param companyId - 公司唯一标识符
   * @param userId - 用户唯一标识符
   * @param input - 更新数据
   * @returns 更新后的公司用户关联记录
   */
  updateByCompanyIdAndUserId(companyId: string, userId: string, input: CompanyUserUpdateInput) {
    return this.update({ companyUserIdx: { companyId, userId } }, input);
  }

  /**
   * 分页查询公司用户关联关系
   * @param skip - 跳过的记录数量（默认为 0）
   * @param take - 获取的记录数量（默认为 10）
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 包含总数和关联关系列表的数组 [总数, 关联关系列表]
   */
  findWithPagination(
    skip: number = 0,
    take: number = 10,
    where?: CompanyUserWhereInput,
    orderBy?: CompanyUserOrderByWithRelationInput
  ) {
    return Promise.all([this.count(where), this.findMany(where, orderBy, skip, take)]);
  }

  /**
   * 查找第一个匹配的公司用户关联关系
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 第一个匹配的公司用户关联记录或 null
   */
  findFirst(where?: CompanyUserWhereInput, orderBy?: CompanyUserOrderByWithRelationInput): Promise<CompanyUser | null> {
    const args: Prisma.CompanyUserFindFirstArgs = {
      include: this.include,
      orderBy,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.companyUser.findFirst(args);
  }

  /**
   * 根据唯一条件查找公司用户关联关系
   * @param where - 唯一查询条件（使用复合索引 companyUserIdx）
   * @returns 匹配的公司用户关联记录或 null
   */
  findUnique(where: Pick<CompanyUserWhereUniqueInput, PickWhereUniqueFields>): Promise<CompanyUser | null> {
    return this.db.companyUser.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.include,
    });
  }

  /**
   * 查询多个公司用户关联关系
   * @param where - 查询条件（可选）
   * @param orderBy - 排序条件（可选）
   * @param skip - 跳过的记录数量（可选）
   * @param take - 获取的记录数量（可选）
   * @returns 符合条件的公司用户关联关系列表
   */
  findMany(
    where?: CompanyUserWhereInput,
    orderBy?: CompanyUserOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<CompanyUser[]> {
    const args: Prisma.CompanyUserFindManyArgs = {
      include: this.include,
      orderBy,
      skip,
      take,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.companyUser.findMany(args);
  }

  /**
   * 统计符合条件的公司用户关联关系数量
   * @param where - 查询条件（可选）
   * @returns 符合条件的记录总数
   */
  count(where?: CompanyUserWhereInput): Promise<number> {
    const args: Prisma.CompanyUserCountArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.companyUser.count(args);
  }

  /**
   * 更新公司用户关联关系
   * @param where - 唯一查询条件（使用复合索引 companyUserIdx）
   * @param input - 更新数据
   * @returns 更新后的公司用户关联记录
   */
  update(
    where: Pick<CompanyUserWhereUniqueInput, PickWhereUniqueFields>,
    input: CompanyUserUpdateInput
  ): Promise<CompanyUser> {
    this.handleInputData(input);
    return this.db.companyUser.update({
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(input),
      include: this.include,
    });
  }

  /**
   * 创建新的公司用户关联关系
   * @param input - 创建关联关系所需的数据
   * @returns 创建的公司用户关联记录
   */
  create(input: CompanyUserCreateInput): Promise<CompanyUser> {
    this.handleInputData(input);
    return this.db.companyUser.create({
      data: this.parseCreateData(input),
      include: this.include,
    });
  }

  /**
   * 创建或更新公司用户关联关系（如果存在则更新，不存在则创建）
   * @param where - 唯一查询条件
   * @param input - 创建/更新数据
   * @returns 创建或更新后的公司用户关联记录
   */
  upsert(
    where: Pick<CompanyUserWhereUniqueInput, PickWhereUniqueFields>,
    input: CompanyUserCreateInput
  ): Promise<CompanyUser> {
    this.handleInputData(input);
    const data = this.parseCreateData(input);
    return this.db.companyUser.upsert({
      where: this.parseUniqueWhere(where),
      update: data,
      create: data,
      include: this.include,
    });
  }

  /**
   * 删除公司用户关联关系
   * @param where - 唯一查询条件（使用复合索引 companyUserIdx）
   * @returns 删除的公司用户关联记录
   */
  delete(where: Pick<CompanyUserWhereUniqueInput, PickWhereUniqueFields>): Promise<CompanyUser> {
    return this.db.companyUser.delete({
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除公司用户关联关系
   * @param where - 查询条件（可选，不指定则删除所有记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteMany(where?: CompanyUserWhereInput) {
    const args: Prisma.CompanyUserDeleteManyArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.companyUser.deleteMany(args);
  }

  /**
   * 根据公司 ID 删除该公司的所有用户关联关系
   * @param companyId - 公司唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByCompanyId(companyId: string) {
    return this.deleteMany({ companyId: { equals: companyId } });
  }

  /**
   * 根据用户 ID 删除该用户的所有公司关联关系
   * @param userId - 用户唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByUserId(userId: string) {
    return this.deleteMany({ userId: { equals: userId } });
  }

  /**
   * 根据角色 ID 删除该角色下的所有用户关联关系
   * @param roleId - 角色唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByRoleId(roleId: string) {
    return this.deleteMany({ roleId: { equals: roleId } });
  }

  /**
   * 根据公司 ID 和用户 ID 删除关联关系
   * @param companyId - 公司唯一标识符
   * @param userId - 用户唯一标识符
   * @returns 删除的公司用户关联记录
   */
  deleteByCompanyIdAndUserId(companyId: string, userId: string) {
    return this.delete({ companyUserIdx: { companyId, userId } });
  }
}
