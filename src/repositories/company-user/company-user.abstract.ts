import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  CompanyUser,
  CompanyUserCreateInput,
  CompanyUserOrderByWithRelationInput,
  CompanyUserUpdateInput,
  CompanyUserWhereInput,
  CompanyUserWhereUniqueInput,
  CreateOneCompanyUserArgs,
  DeleteManyCompanyUserArgs,
  DeleteOneCompanyUserArgs,
  FindFirstCompanyUserArgs,
  FindManyCompanyUserArgs,
  FindUniqueCompanyUserArgs,
  UpdateOneCompanyUserArgs,
  UpsertOneCompanyUserArgs,
} from 'src/generated/graphql';
import {
  CompanyUserCreateInputObjectZodSchema,
  CompanyUserIncludeObjectZodSchema,
  CompanyUserOrderByWithRelationInputObjectZodSchema,
  CompanyUserUpdateInputObjectZodSchema,
  CompanyUserWhereInputObjectZodSchema,
  CompanyUserWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 企业用户关联数据访问抽象类
 *
 * 该抽象类提供了对企业用户关联数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class CompanyUserAbstract {
  /**
   * 构造函数
   *
   * @param db - 数据库服务实例，用于执行数据库操作
   */
  protected constructor(protected readonly db: DatabaseService) {}

  /**
   * 处理解析后的数据
   *
   * 此抽象方法需要在子类中实现，用于在创建或更新操作前处理数据
   *
   * @param input - 输入的创建或更新数据
   * @returns 处理后的数据
   */
  protected abstract handleParsedData<T extends Prisma.CompanyUserCreateInput | Prisma.CompanyUserUpdateInput>(
    input: T
  ): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.CompanyUserInclude = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.CompanyUserInclude) {
    this.include = CompanyUserIncludeObjectZodSchema.parse(include) as Prisma.CompanyUserInclude;
    return this;
  }

  /**
   * 获取包含关系配置
   *
   * @returns 当前设置的包含关系配置
   */
  getInclude() {
    return this.include;
  }

  /**
   * 解析查询条件
   *
   * 使用Zod验证并转换查询条件
   *
   * @param where - 查询条件
   * @returns 解析后的Prisma查询条件
   * @private
   */
  private parseWhere(where: CompanyUserWhereInput) {
    return CompanyUserWhereInputObjectZodSchema.parse(where) as unknown as Prisma.CompanyUserWhereInput;
  }

  /**
   * 解析唯一查询条件
   *
   * 使用Zod验证并转换唯一查询条件
   *
   * @param where - 唯一查询条件
   * @returns 解析后的Prisma唯一查询条件
   * @private
   */
  private parseUniqueWhere(where: CompanyUserWhereUniqueInput) {
    return CompanyUserWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.CompanyUserWhereUniqueInput;
  }

  /**
   * 解析创建数据
   *
   * 使用Zod验证并转换创建数据
   *
   * @param data - 创建数据
   * @returns 解析后的Prisma创建数据
   * @private
   */
  private parseCreateData(data: CompanyUserCreateInput) {
    return CompanyUserCreateInputObjectZodSchema.parse(data) as unknown as Prisma.CompanyUserCreateInput;
  }

  /**
   * 解析更新数据
   *
   * 使用Zod验证并转换更新数据
   *
   * @param data - 更新数据
   * @returns 解析后的Prisma更新数据
   * @private
   */
  private parseUpdateData(data: CompanyUserUpdateInput) {
    return CompanyUserUpdateInputObjectZodSchema.parse(data) as unknown as Prisma.CompanyUserUpdateInput;
  }

  /**
   * 解析排序条件
   *
   * 使用Zod验证并转换排序条件，支持单个排序条件或排序条件数组
   *
   * @param orderBy - 排序条件或排序条件数组
   * @returns 解析后的Prisma排序条件
   * @private
   */
  private parseOrderBy(orderBy: CompanyUserOrderByWithRelationInput | CompanyUserOrderByWithRelationInput[]) {
    if (Array.isArray(orderBy)) {
      return z
        .array(CompanyUserOrderByWithRelationInputObjectZodSchema)
        .parse(orderBy) as unknown as Prisma.CompanyUserOrderByWithRelationInput[];
    }
    return CompanyUserOrderByWithRelationInputObjectZodSchema.parse(
      orderBy
    ) as unknown as Prisma.CompanyUserOrderByWithRelationInput;
  }

  /**
   * 解析查询多个或第一个记录的参数
   *
   * 处理查询参数，包括包含关系、查询条件、排序、分页等
   *
   * @param args - 查询参数
   * @returns 处理后的查询参数对象
   * @private
   */
  private parseManyOrFirstArgs(args: FindManyCompanyUserArgs | FindFirstCompanyUserArgs) {
    const include = this.getInclude();
    const where = args.where ? this.parseWhere(args.where) : undefined;
    const orderBy = args.orderBy ? this.parseOrderBy(args.orderBy) : undefined;
    const skip = args.skip ? args.skip : undefined;
    const take = args.take ? args.take : undefined;
    const distinct = args.distinct ? args.distinct : undefined;
    const cursor = args.cursor ? this.parseUniqueWhere(args.cursor) : undefined;
    return { include, where, orderBy, skip, take, distinct, cursor };
  }

  /**
   * 查找唯一企业用户关联记录
   *
   * 根据唯一条件查询单个企业用户关联记录
   *
   * @param where - 查询条件
   * @returns 企业用户关联记录或null
   */
  findUnique(where: FindUniqueCompanyUserArgs['where']): PrismaPromise<CompanyUser | null> {
    return this.db.companyUser.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.getInclude(),
    });
  }

  /**
   * 查找第一个匹配的企业用户关联记录
   *
   * 根据条件查询第一个匹配的企业用户关联记录
   *
   * @param args - 查询参数
   * @returns 企业用户关联记录或null
   */
  findFirst(args: FindFirstCompanyUserArgs): PrismaPromise<CompanyUser | null> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.companyUser.findFirst({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 查找多个企业用户关联记录
   *
   * 根据条件查询多个企业用户关联记录
   *
   * @param args - 查询参数
   * @returns 企业用户关联记录数组
   */
  findMany(args: FindManyCompanyUserArgs): PrismaPromise<CompanyUser[]> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.companyUser.findMany({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 计算符合条件的企业用户关联记录数量
   *
   * @param where - 查询条件
   * @returns 记录数量
   */
  count(where?: FindManyCompanyUserArgs['where']): PrismaPromise<number> {
    return this.db.companyUser.count({
      where: where ? this.parseWhere(where) : undefined,
    });
  }

  /**
   * 创建企业用户关联记录
   *
   * @param data - 创建数据
   * @returns 创建的企业用户关联记录
   */
  create(data: CreateOneCompanyUserArgs['data']): PrismaPromise<CompanyUser> {
    return this.db.companyUser.create({
      include: this.getInclude(),
      data: this.parseCreateData(data),
    });
  }

  /**
   * 更新企业用户关联记录
   *
   * @param where - 更新条件
   * @param data - 更新数据
   * @returns 更新后的企业用户关联记录
   */
  update(where: UpdateOneCompanyUserArgs['where'], data: UpdateOneCompanyUserArgs['data']): PrismaPromise<CompanyUser> {
    return this.db.companyUser.update({
      include: this.getInclude(),
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(data),
    });
  }

  /**
   * 更新或创建企业用户关联记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的企业用户关联记录
   */
  upsert(args: UpsertOneCompanyUserArgs): PrismaPromise<CompanyUser> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.companyUser.upsert({ include, where, create, update });
  }

  /**
   * 删除企业用户关联记录
   *
   * @param where - 删除条件
   * @returns 删除的企业用户关联记录
   */
  delete(where: DeleteOneCompanyUserArgs['where']): PrismaPromise<CompanyUser> {
    return this.db.companyUser.delete({ where: this.parseUniqueWhere(where), include: this.getInclude() });
  }

  /**
   * 批量删除企业用户关联记录
   *
   * @param where - 删除条件
   * @param limit - 限制删除数量
   * @returns 删除操作结果
   */
  deleteMany(where?: DeleteManyCompanyUserArgs['where'], limit?: number) {
    return this.db.companyUser.deleteMany({
      where: where ? this.parseWhere(where) : undefined,
      limit,
    });
  }
}
