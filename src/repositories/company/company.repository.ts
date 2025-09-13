import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { CreateCompanyInput, UpdateCompanyInput } from 'src/generated/dto';
import {
  CompanyWhereInput,
  CompanyWhereUniqueInput,
  CompanyOrderByWithRelationInput,
} from 'src/generated/graphql/company';
import {
  CompanyCreateInputObjectZodSchema,
  CompanyUpdateInputObjectSchema,
  CompanyWhereInputObjectSchema,
  CompanyWhereUniqueInputObjectSchema,
} from 'src/generated/schemas';

type PickWhereUniqueFields = 'id' | 'name' | 'code';

/**
 * 公司数据访问层
 * 提供对公司的完整 CRUD 操作
 *
 * @description 该仓库类封装了所有与公司相关的数据库操作，
 * 包括查询、创建、更新、删除等功能，并提供了分页查询和批量操作的支持。
 * 使用 id 字段作为唯一标识符，支持按名称查询和更新操作。
 */
@Injectable()
export class CompanyRepository {
  constructor(private readonly db: DatabaseService) {}

  /** 关联查询配置，用于指定查询时需要包含的关联数据 */
  private include: Prisma.CompanyInclude = {};

  /**
   * 设置关联查询配置
   * @param include - Prisma 关联查询配置对象
   */
  setInclude(include: Prisma.CompanyInclude) {
    this.include = include;
    return this;
  }

  /**
   * 处理输入数据
   * @param input - 输入数据
   */
  private handleInputData(input: CreateCompanyInput | UpdateCompanyInput) {
    // 此repository暂时不需要特殊处理输入数据
    return input;
  }

  /**
   * 解析创建数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 创建公司的输入数据
   * @returns 解析后的创建数据
   */
  private parseCreateData(input: CreateCompanyInput) {
    return CompanyCreateInputObjectZodSchema.omit({
      auths: true,
      admins: true,
      roles: true,
      users: true,
      logs: true,
      mediaFolders: true,
      mediaFiles: true,
    }).parse(input) as unknown as Prisma.CompanyCreateInput;
  }

  /**
   * 解析更新数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 更新公司的输入数据
   * @returns 解析后的更新数据
   */
  private parseUpdateData(input: UpdateCompanyInput) {
    return CompanyUpdateInputObjectSchema.parse(input) as unknown as Prisma.CompanyUpdateInput;
  }

  /**
   * 解析查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 查询条件
   * @returns 解析后的查询条件
   */
  private parseManyWhere(where: CompanyWhereInput) {
    return CompanyWhereInputObjectSchema.parse(where) as unknown as Prisma.CompanyWhereInput;
  }

  /**
   * 根据公司名称查找公司
   * @param name - 公司名称
   * @returns 匹配的公司记录或 null
   */
  findByName(name: string) {
    return this.findFirst({ name: { equals: name } });
  }

  /**
   * 根据公司 ID 查找公司
   * @param id - 公司唯一标识符
   * @returns 匹配的公司记录或 null
   */
  findById(id: string) {
    return this.findUnique({ id });
  }

  /**
   * 根据公司名称更新公司信息
   * @param name - 公司名称
   * @param input - 更新数据
   * @returns 更新后的公司记录或 null
   */
  async updateByName(name: string, input: UpdateCompanyInput) {
    const company = await this.findByName(name);
    if (!company) return null;
    return this.update({ id: company.id }, input);
  }

  /**
   * 根据公司 ID 更新公司信息
   * @param id - 公司唯一标识符
   * @param input - 更新数据
   * @returns 更新后的公司记录
   */
  updateById(id: string, input: UpdateCompanyInput) {
    return this.update({ id }, input);
  }

  /**
   * 分页查询公司
   * @param skip - 跳过的记录数量（默认为 0）
   * @param take - 获取的记录数量（默认为 10）
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 包含总数和公司列表的数组 [总数, 公司列表]
   */
  findWithPagination(
    skip: number = 0,
    take: number = 10,
    where?: CompanyWhereInput,
    orderBy?: CompanyOrderByWithRelationInput
  ) {
    return Promise.all([this.count(where), this.findMany(where, orderBy, skip, take)]);
  }

  /**
   * 查找第一个匹配的公司
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 第一个匹配的公司记录或 null
   */
  findFirst(where?: CompanyWhereInput, orderBy?: CompanyOrderByWithRelationInput) {
    const args: Prisma.CompanyFindFirstArgs = { include: this.include, orderBy };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.company.findFirst(args);
  }

  /**
   * 根据唯一条件查找公司
   * @param where - 唯一查询条件（只能使用 id）
   * @returns 匹配的公司记录或 null
   */
  findUnique(where: Pick<CompanyWhereUniqueInput, PickWhereUniqueFields>) {
    return this.db.company.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.include,
    });
  }

  /**
   * 查询多个公司
   * @param where - 查询条件（可选）
   * @param orderBy - 排序条件（可选）
   * @param skip - 跳过的记录数量（可选）
   * @param take - 获取的记录数量（可选）
   * @returns 符合条件的公司列表
   */
  findMany(where?: CompanyWhereInput, orderBy?: CompanyOrderByWithRelationInput, skip?: number, take?: number) {
    const args: Prisma.CompanyFindManyArgs = {
      include: this.include,
      orderBy,
      skip,
      take,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.company.findMany(args);
  }

  /**
   * 统计符合条件的公司数量
   * @param where - 查询条件（可选）
   * @returns 符合条件的记录总数
   */
  count(where?: CompanyWhereInput) {
    const args: Prisma.CompanyCountArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.company.count(args);
  }

  /**
   * 解析唯一查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 唯一查询条件
   * @returns 解析后的唯一查询条件
   */
  private parseUniqueWhere(where: CompanyWhereUniqueInput) {
    return CompanyWhereUniqueInputObjectSchema.parse(where) as unknown as Prisma.CompanyWhereUniqueInput;
  }

  /**
   * 更新公司信息
   * @param where - 唯一查询条件（只能使用 id）
   * @param input - 更新数据
   * @returns 更新后的公司记录
   */
  update(where: Pick<CompanyWhereUniqueInput, PickWhereUniqueFields>, input: UpdateCompanyInput) {
    this.handleInputData(input);
    return this.db.company.update({
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(input),
    });
  }

  /**
   * 创建新的公司
   * @param input - 创建公司所需的数据
   * @returns 创建的公司记录
   */
  create(input: CreateCompanyInput) {
    this.handleInputData(input);
    return this.db.company.create({
      data: this.parseCreateData(input),
    });
  }

  /**
   * 创建或更新公司（如果存在则更新，不存在则创建）
   * @param where - 唯一查询条件
   * @param input - 创建/更新数据
   * @returns 创建或更新后的公司记录
   */
  upsert(where: Pick<CompanyWhereUniqueInput, PickWhereUniqueFields>, input: CreateCompanyInput) {
    this.handleInputData(input);
    const data = this.parseCreateData(input);
    return this.db.company.upsert({
      where: this.parseUniqueWhere(where),
      update: data,
      create: data,
    });
  }

  /**
   * 删除公司
   * @param where - 唯一查询条件（只能使用 id）
   * @returns 删除的公司记录
   */
  delete(where: Pick<CompanyWhereUniqueInput, PickWhereUniqueFields>) {
    return this.db.company.delete({
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除公司
   * @param where - 查询条件（可选，不指定则删除所有记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteMany(where?: CompanyWhereInput) {
    const args: Prisma.CompanyDeleteManyArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.company.deleteMany(args);
  }
}
