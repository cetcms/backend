import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  CompanyRole,
  CompanyRoleWhereInput,
  CompanyRoleCreateInput,
  CompanyRoleUpdateInput,
  CompanyRoleWhereUniqueInput,
  CompanyRoleOrderByWithRelationInput,
} from 'src/generated/graphql/company-role';
import {
  CompanyRoleCreateInputObjectZodSchema,
  CompanyRoleUpdateInputObjectSchema,
  CompanyRoleWhereInputObjectSchema,
  CompanyRoleWhereUniqueInputObjectSchema,
} from 'src/generated/schemas';
import voca from 'voca';

type PickWhereUniqueFields = 'id' | 'companyRoleIdx';

/**
 * 公司角色数据访问层
 * 提供对公司角色的完整 CRUD 操作
 *
 * @description 该仓库类封装了所有与公司角色相关的数据库操作，
 * 包括查询、创建、更新、删除等功能，并提供了分页查询和批量操作的支持。
 * 利用了 companyId 和 code 的复合唯一约束特性进行优化查询。
 */
@Injectable()
export class CompanyRoleRepository {
  constructor(private readonly db: DatabaseService) {}

  /** 关联查询配置，用于指定查询时需要包含的关联数据 */
  private include: Prisma.CompanyRoleInclude = {};

  /**
   * 设置关联查询配置
   * @param include - Prisma 关联查询配置对象
   */
  setInclude(include: Prisma.CompanyRoleInclude) {
    this.include = include;
    return this;
  }

  private handleInputData(input: CompanyRoleCreateInput | CompanyRoleUpdateInput) {
    if (input.name) input.name = voca.titleCase(input.name);
    if (input.code) input.code = voca.snakeCase(input.code).toUpperCase();
    return input;
  }

  /**
   * 解析创建数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 创建公司角色的输入数据
   * @returns 解析后的创建数据
   */
  private parseCreateData(input: CompanyRoleCreateInput) {
    return CompanyRoleCreateInputObjectZodSchema.omit({
      users: true,
    }).parse(input) as unknown as Prisma.CompanyRoleCreateInput;
  }

  /**
   * 解析更新数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 更新公司角色的输入数据
   * @returns 解析后的更新数据
   */
  private parseUpdateData(input: CompanyRoleUpdateInput) {
    return CompanyRoleUpdateInputObjectSchema.parse(input) as unknown as Prisma.CompanyRoleUpdateInput;
  }

  /**
   * 解析查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 查询条件
   * @returns 解析后的查询条件
   */
  private parseManyWhere(where: CompanyRoleWhereInput) {
    return CompanyRoleWhereInputObjectSchema.parse(where) as unknown as Prisma.CompanyRoleWhereInput;
  }

  /**
   * 解析唯一查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 唯一查询条件
   * @returns 解析后的唯一查询条件
   */
  private parseUniqueWhere(where: CompanyRoleWhereUniqueInput) {
    return CompanyRoleWhereUniqueInputObjectSchema.parse(where) as unknown as Prisma.CompanyRoleWhereUniqueInput;
  }

  /**
   * 根据角色代码和公司 ID 查找公司角色
   * @param companyId - 公司唯一标识符
   * @param code - 角色代码
   * @returns 匹配的公司角色记录或 null
   */
  findByCompanyIdAndCode(companyId: string, code: string) {
    return this.findUnique({ companyRoleIdx: { companyId, code } });
  }

  /**
   * 根据角色 ID 查找公司角色
   * @param id - 角色唯一标识符
   * @returns 匹配的公司角色记录或 null
   */
  findById(id: string) {
    return this.findUnique({ id });
  }

  /**
   * 根据公司 ID 查找所有角色
   * @param companyId - 公司唯一标识符
   * @returns 该公司的所有角色列表
   */
  findByCompanyId(companyId: string) {
    return this.findMany({ companyId: { equals: companyId } });
  }

  /**
   * 根据角色代码和公司 ID 更新公司角色
   * @param companyId - 公司唯一标识符
   * @param code - 角色代码
   * @param input - 更新数据
   * @returns 更新后的公司角色记录
   */
  updateByCompanyIdAndCode(companyId: string, code: string, input: CompanyRoleUpdateInput): Promise<CompanyRole> {
    return this.update({ companyRoleIdx: { companyId, code } }, input);
  }

  /**
   * 根据角色 ID 更新公司角色
   * @param id - 角色唯一标识符
   * @param input - 更新数据
   * @returns 更新后的公司角色记录
   */
  updateById(id: string, input: CompanyRoleUpdateInput): Promise<CompanyRole> {
    return this.update({ id }, input);
  }

  /**
   * 分页查询公司角色
   * @param skip - 跳过的记录数量（默认为 0）
   * @param take - 获取的记录数量（默认为 10）
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 包含总数和角色列表的数组 [总数, 角色列表]
   */
  findWithPagination(
    skip: number = 0,
    take: number = 10,
    where?: CompanyRoleWhereInput,
    orderBy?: CompanyRoleOrderByWithRelationInput
  ) {
    return Promise.all([this.count(where), this.findMany(where, orderBy, skip, take)]);
  }

  /**
   * 查找第一个匹配的公司角色
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 第一个匹配的公司角色记录或 null
   */
  findFirst(where?: CompanyRoleWhereInput, orderBy?: CompanyRoleOrderByWithRelationInput): Promise<CompanyRole | null> {
    const args: Prisma.CompanyRoleFindFirstArgs = {
      include: this.include,
      orderBy,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.companyRole.findFirst(args);
  }

  /**
   * 根据唯一条件查找公司角色
   * @param where - 唯一查询条件（可使用 id 或 companyRoleIdx）
   * @returns 匹配的公司角色记录或 null
   */
  findUnique(where: Pick<CompanyRoleWhereUniqueInput, PickWhereUniqueFields>): Promise<CompanyRole | null> {
    return this.db.companyRole.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.include,
    });
  }

  /**
   * 查询多个公司角色
   * @param where - 查询条件（可选）
   * @param orderBy - 排序条件（可选）
   * @param skip - 跳过的记录数量（可选）
   * @param take - 获取的记录数量（可选）
   * @returns 符合条件的公司角色列表
   */
  findMany(
    where?: CompanyRoleWhereInput,
    orderBy?: CompanyRoleOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<CompanyRole[]> {
    const args: Prisma.CompanyRoleFindManyArgs = {
      include: this.include,
      orderBy,
      skip,
      take,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.companyRole.findMany(args);
  }

  /**
   * 统计符合条件的公司角色数量
   * @param where - 查询条件（可选）
   * @returns 符合条件的记录总数
   */
  count(where?: CompanyRoleWhereInput): Promise<number> {
    const args: Prisma.CompanyRoleCountArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.companyRole.count(args);
  }

  /**
   * 更新公司角色
   * @param where - 唯一查询条件（可使用 id 或 companyRoleIdx）
   * @param input - 更新数据
   * @returns 更新后的公司角色记录
   */
  update(
    where: Pick<CompanyRoleWhereUniqueInput, PickWhereUniqueFields>,
    input: CompanyRoleUpdateInput
  ): Promise<CompanyRole> {
    this.handleInputData(input);
    return this.db.companyRole.update({
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(input),
      include: this.include,
    });
  }

  /**
   * 创建新的公司角色
   * @param input - 创建角色所需的数据
   * @returns 创建的公司角色记录
   */
  create(input: CompanyRoleCreateInput): Promise<CompanyRole> {
    this.handleInputData(input);
    return this.db.companyRole.create({
      data: this.parseCreateData(input),
      include: this.include,
    });
  }

  /**
   * 创建或更新公司角色（如果存在则更新，不存在则创建）
   * @param where - 唯一查询条件
   * @param input - 创建/更新数据
   * @returns 创建或更新后的公司角色记录
   */
  upsert(
    where: Pick<CompanyRoleWhereUniqueInput, PickWhereUniqueFields>,
    input: CompanyRoleCreateInput
  ): Promise<CompanyRole> {
    this.handleInputData(input);
    const data = this.parseCreateData(input);
    return this.db.companyRole.upsert({
      where: this.parseUniqueWhere(where),
      create: data,
      update: data,
      include: this.include,
    });
  }

  /**
   * 删除公司角色
   * @param where - 唯一查询条件（可使用 id 或 companyRoleIdx）
   * @returns 删除的公司角色记录
   */
  delete(where: Pick<CompanyRoleWhereUniqueInput, PickWhereUniqueFields>): Promise<CompanyRole> {
    return this.db.companyRole.delete({
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除公司角色
   * @param where - 查询条件（可选，不指定则删除所有记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteMany(where?: CompanyRoleWhereInput) {
    const args: Prisma.CompanyRoleDeleteManyArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.companyRole.deleteMany(args);
  }

  /**
   * 根据公司 ID 删除该公司的所有角色
   * @param companyId - 公司唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByCompanyId(companyId: string) {
    return this.deleteMany({ companyId: { equals: companyId } });
  }

  /**
   * 根据角色代码和公司 ID 删除公司角色
   * @param companyId - 公司唯一标识符
   * @param code - 角色代码
   * @returns 删除的公司角色记录
   */
  deleteByCompanyIdAndCode(companyId: string, code: string) {
    return this.delete({ companyRoleIdx: { companyId, code } });
  }
}
