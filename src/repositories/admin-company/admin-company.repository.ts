import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { CreateAdminCompanyInput, UpdateAdminCompanyInput } from 'src/generated/dto';
import {
  AdminCompanyWhereInput,
  AdminCompanyWhereUniqueInput,
  AdminCompanyOrderByWithRelationInput,
  AdminCompany,
} from 'src/generated/graphql/admin-company';
import {
  AdminCompanyCreateInputObjectZodSchema,
  AdminCompanyUpdateInputObjectSchema,
  AdminCompanyWhereInputObjectSchema,
  // AdminCompanyWhereUniqueInputObjectSchema,
} from 'src/generated/schemas';

type PickWhereUniqueFields = 'adminCompanyIdx';

/**
 * 管理员公司关联数据访问层
 * 提供对管理员与公司关联关系的完整 CRUD 操作
 *
 * @description 该仓库类封装了所有与管理员公司关联相关的数据库操作，
 * 包括查询、创建、更新、删除等功能，并提供了分页查询和批量操作的支持。
 * 利用了 adminId 和 companyId 的复合唯一约束特性进行优化查询。
 */
@Injectable()
export class AdminCompanyRepository {
  constructor(private readonly db: DatabaseService) {}

  /** 关联查询配置，用于指定查询时需要包含的关联数据 */
  private include: Prisma.AdminCompanyInclude = {};

  /**
   * 设置关联查询配置
   * @param include - Prisma 关联查询配置对象
   */
  setInclude(include: Prisma.AdminCompanyInclude) {
    this.include = include;
    return this;
  }

  /**
   * 处理输入数据
   * @param input - 输入数据
   */
  private handleInputData(input: CreateAdminCompanyInput | UpdateAdminCompanyInput) {
    // 此repository暂时不需要特殊处理输入数据
    return input;
  }

  /**
   * 解析创建数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 创建管理员公司关联的输入数据
   * @returns 解析后的创建数据
   */
  private parseCreateData(input: CreateAdminCompanyInput) {
    return AdminCompanyCreateInputObjectZodSchema.parse(input) as unknown as Prisma.AdminCompanyCreateInput;
  }

  /**
   * 解析更新数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 更新管理员公司关联的输入数据
   * @returns 解析后的更新数据
   */
  private parseUpdateData(input: UpdateAdminCompanyInput) {
    return AdminCompanyUpdateInputObjectSchema.parse(input) as unknown as Prisma.AdminCompanyUpdateInput;
  }

  /**
   * 解析查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 查询条件
   * @returns 解析后的查询条件
   */
  private parseManyWhere(where: AdminCompanyWhereInput) {
    return AdminCompanyWhereInputObjectSchema.parse(where) as unknown as Prisma.AdminCompanyWhereInput;
  }

  /**
   * 解析唯一查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 唯一查询条件
   * @returns 解析后的唯一查询条件
   */
  private parseUniqueWhere(where: AdminCompanyWhereUniqueInput) {
    return { adminCompanyIdx: where.adminCompanyIdx };
  }

  /**
   * 根据管理员 ID 查找所有关联的公司
   * @param adminId - 管理员唯一标识符
   * @returns 该管理员关联的所有公司记录列表
   */
  findByAdminId(adminId: string) {
    return this.findMany({ adminId: { equals: adminId } });
  }

  /**
   * 根据公司 ID 查找所有关联的管理员
   * @param companyId - 公司唯一标识符
   * @returns 该公司关联的所有管理员记录列表
   */
  findByCompanyId(companyId: string) {
    return this.findMany({ companyId: { equals: companyId } });
  }

  /**
   * 根据管理员 ID 和公司 ID 查找特定关联关系
   * @param adminId - 管理员唯一标识符
   * @param companyId - 公司唯一标识符
   * @returns 匹配的管理员公司关联记录或 null
   */
  findByAdminIdAndCompanyId(adminId: string, companyId: string) {
    return this.findUnique({ adminCompanyIdx: { adminId, companyId } });
  }

  /**
   * 根据管理员 ID 和公司 ID 更新关联关系
   * @param adminId - 管理员唯一标识符
   * @param companyId - 公司唯一标识符
   * @param input - 更新数据
   * @returns 更新后的管理员公司关联记录
   */
  updateByAdminIdAndCompanyId(adminId: string, companyId: string, input: UpdateAdminCompanyInput) {
    return this.update({ adminCompanyIdx: { adminId, companyId } }, input);
  }

  /**
   * 分页查询管理员公司关联关系
   * @param skip - 跳过的记录数量（默认为 0）
   * @param take - 获取的记录数量（默认为 10）
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 包含总数和关联关系列表的数组 [总数, 关联关系列表]
   */
  findWithPagination(
    skip: number = 0,
    take: number = 10,
    where?: AdminCompanyWhereInput,
    orderBy?: AdminCompanyOrderByWithRelationInput
  ) {
    return Promise.all([this.count(where), this.findMany(where, orderBy, skip, take)]);
  }

  /**
   * 查找第一个匹配的管理员公司关联关系
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 第一个匹配的管理员公司关联记录或 null
   */
  findFirst(where?: AdminCompanyWhereInput, orderBy?: AdminCompanyOrderByWithRelationInput) {
    const args: Prisma.AdminCompanyFindFirstArgs = {
      include: this.include,
      orderBy,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.adminCompany.findFirst(args);
  }

  /**
   * 根据唯一条件查找管理员公司关联关系
   * @param where - 唯一查询条件（使用复合索引 adminCompanyIdx）
   * @returns 匹配的管理员公司关联记录或 null
   */
  findUnique(where: Pick<AdminCompanyWhereUniqueInput, PickWhereUniqueFields>): Promise<AdminCompany | null> {
    return this.db.adminCompany.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.include,
    });
  }

  /**
   * 查询多个管理员公司关联关系
   * @param where - 查询条件（可选）
   * @param orderBy - 排序条件（可选）
   * @param skip - 跳过的记录数量（可选）
   * @param take - 获取的记录数量（可选）
   * @returns 符合条件的管理员公司关联关系列表
   */
  findMany(
    where?: AdminCompanyWhereInput,
    orderBy?: AdminCompanyOrderByWithRelationInput,
    skip?: number,
    take?: number
  ) {
    const args: Prisma.AdminCompanyFindManyArgs = {
      include: this.include,
      orderBy,
      skip,
      take,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.adminCompany.findMany(args);
  }

  /**
   * 统计符合条件的管理员公司关联关系数量
   * @param where - 查询条件（可选）
   * @returns 符合条件的记录总数
   */
  count(where?: AdminCompanyWhereInput) {
    const args: Prisma.AdminCompanyCountArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.adminCompany.count(args);
  }

  /**
   * 更新管理员公司关联关系
   * @param where - 唯一查询条件（使用复合索引 adminCompanyIdx）
   * @param input - 更新数据
   * @returns 更新后的管理员公司关联记录
   */
  update(where: Pick<AdminCompanyWhereUniqueInput, PickWhereUniqueFields>, input: UpdateAdminCompanyInput) {
    this.handleInputData(input);
    return this.db.adminCompany.update({
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(input),
    });
  }

  /**
   * 创建新的管理员公司关联关系
   * @param input - 创建关联关系所需的数据
   * @returns 创建的管理员公司关联记录
   */
  create(input: CreateAdminCompanyInput) {
    this.handleInputData(input);
    return this.db.adminCompany.create({
      data: this.parseCreateData(input),
    });
  }

  /**
   * 创建或更新管理员公司关联关系（如果存在则更新，不存在则创建）
   * @param where - 唯一查询条件
   * @param input - 创建/更新数据
   * @returns 创建或更新后的管理员公司关联记录
   */
  upsert(where: Pick<AdminCompanyWhereUniqueInput, PickWhereUniqueFields>, input: CreateAdminCompanyInput) {
    this.handleInputData(input);
    const data = this.parseCreateData(input);
    return this.db.adminCompany.upsert({
      where: this.parseUniqueWhere(where),
      update: data,
      create: data,
    });
  }

  /**
   * 删除管理员公司关联关系
   * @param where - 唯一查询条件（使用复合索引 adminCompanyIdx）
   * @returns 删除的管理员公司关联记录
   */
  delete(where: Pick<AdminCompanyWhereUniqueInput, PickWhereUniqueFields>) {
    return this.db.adminCompany.delete({
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除管理员公司关联关系
   * @param where - 查询条件（可选，不指定则删除所有记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteMany(where?: AdminCompanyWhereInput) {
    const args: Prisma.AdminCompanyDeleteManyArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.adminCompany.deleteMany(args);
  }

  /**
   * 根据管理员 ID 删除该管理员的所有公司关联关系
   * @param adminId - 管理员唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByAdminId(adminId: string) {
    return this.deleteMany({ adminId: { equals: adminId } });
  }

  /**
   * 根据公司 ID 删除该公司的所有管理员关联关系
   * @param companyId - 公司唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByCompanyId(companyId: string) {
    return this.deleteMany({ companyId: { equals: companyId } });
  }

  /**
   * 根据管理员 ID 和公司 ID 删除关联关系
   * @param adminId - 管理员唯一标识符
   * @param companyId - 公司唯一标识符
   * @returns 删除的管理员公司关联记录
   */
  deleteByAdminIdAndCompanyId(adminId: string, companyId: string) {
    return this.delete({ adminCompanyIdx: { adminId, companyId } });
  }
}
