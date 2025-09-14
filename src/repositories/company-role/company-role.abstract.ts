import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  CompanyRole,
  CompanyRoleCreateInput,
  CompanyRoleOrderByWithRelationInput,
  CompanyRoleUpdateInput,
  CompanyRoleWhereInput,
  CompanyRoleWhereUniqueInput,
  CreateOneCompanyRoleArgs,
  DeleteManyCompanyRoleArgs,
  DeleteOneCompanyRoleArgs,
  FindFirstCompanyRoleArgs,
  FindManyCompanyRoleArgs,
  FindUniqueCompanyRoleArgs,
  UpdateOneCompanyRoleArgs,
  UpsertOneCompanyRoleArgs,
} from 'src/generated/graphql';
import {
  CompanyRoleCreateInputObjectZodSchema,
  CompanyRoleIncludeObjectZodSchema,
  CompanyRoleOrderByWithRelationInputObjectZodSchema,
  CompanyRoleUpdateInputObjectZodSchema,
  CompanyRoleWhereInputObjectZodSchema,
  CompanyRoleWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 企业角色数据访问抽象类
 *
 * 该抽象类提供了对企业角色数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class CompanyRoleAbstract {
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
  protected abstract handleParsedData<T extends Prisma.CompanyRoleCreateInput | Prisma.CompanyRoleUpdateInput>(
    input: T
  ): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.CompanyRoleInclude = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.CompanyRoleInclude) {
    this.include = CompanyRoleIncludeObjectZodSchema.parse(include) as Prisma.CompanyRoleInclude;
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
  private parseWhere(where: CompanyRoleWhereInput) {
    return CompanyRoleWhereInputObjectZodSchema.parse(where) as unknown as Prisma.CompanyRoleWhereInput;
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
  private parseUniqueWhere(where: CompanyRoleWhereUniqueInput) {
    return CompanyRoleWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.CompanyRoleWhereUniqueInput;
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
  private parseCreateData(data: CompanyRoleCreateInput) {
    return CompanyRoleCreateInputObjectZodSchema.parse(data) as unknown as Prisma.CompanyRoleCreateInput;
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
  private parseUpdateData(data: CompanyRoleUpdateInput) {
    return CompanyRoleUpdateInputObjectZodSchema.parse(data) as unknown as Prisma.CompanyRoleUpdateInput;
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
  private parseOrderBy(orderBy: CompanyRoleOrderByWithRelationInput | CompanyRoleOrderByWithRelationInput[]) {
    if (Array.isArray(orderBy)) {
      return z
        .array(CompanyRoleOrderByWithRelationInputObjectZodSchema)
        .parse(orderBy) as unknown as Prisma.CompanyRoleOrderByWithRelationInput[];
    }
    return CompanyRoleOrderByWithRelationInputObjectZodSchema.parse(
      orderBy
    ) as unknown as Prisma.CompanyRoleOrderByWithRelationInput;
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
  private parseManyOrFirstArgs(args: FindManyCompanyRoleArgs | FindFirstCompanyRoleArgs) {
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
   * 查找唯一企业角色记录
   *
   * 根据唯一条件查询单个企业角色记录
   *
   * @param args - 查询参数
   * @returns 企业角色记录或null
   */
  findUnique(args: FindUniqueCompanyRoleArgs): PrismaPromise<CompanyRole | null> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    return this.db.companyRole.findUnique({ include, where });
  }

  /**
   * 查找第一个匹配的企业角色记录
   *
   * 根据条件查询第一个匹配的企业角色记录
   *
   * @param args - 查询参数
   * @returns 企业角色记录或null
   */
  findFirst(args: FindFirstCompanyRoleArgs): PrismaPromise<CompanyRole | null> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.companyRole.findFirst({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 查找多个企业角色记录
   *
   * 根据条件查询多个企业角色记录
   *
   * @param args - 查询参数
   * @returns 企业角色记录数组
   */
  findMany(args: FindManyCompanyRoleArgs): PrismaPromise<CompanyRole[]> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.companyRole.findMany({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 计算符合条件的企业角色记录数量
   *
   * @param args - 查询参数
   * @returns 记录数量
   */
  count(args: FindManyCompanyRoleArgs): PrismaPromise<number> {
    const where = args.where ? this.parseWhere(args.where) : undefined;
    return this.db.companyRole.count({ where });
  }

  /**
   * 创建企业角色记录
   *
   * @param args - 创建参数
   * @returns 创建的企业角色记录
   */
  create(args: CreateOneCompanyRoleArgs): PrismaPromise<CompanyRole> {
    const include = this.getInclude();
    const data = this.parseCreateData(args.data);
    return this.db.companyRole.create({ include, data });
  }

  /**
   * 更新企业角色记录
   *
   * @param args - 更新参数
   * @returns 更新后的企业角色记录
   */
  update(args: UpdateOneCompanyRoleArgs): PrismaPromise<CompanyRole> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    const data = this.parseUpdateData(args.data);
    return this.db.companyRole.update({ include, where, data });
  }

  /**
   * 更新或创建企业角色记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的企业角色记录
   */
  upsert(args: UpsertOneCompanyRoleArgs): PrismaPromise<CompanyRole> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.companyRole.upsert({ include, where, create, update });
  }

  /**
   * 删除企业角色记录
   *
   * @param args - 删除参数
   * @returns 删除的企业角色记录
   */
  delete(args: DeleteOneCompanyRoleArgs): PrismaPromise<CompanyRole> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    return this.db.companyRole.delete({ include, where });
  }

  /**
   * 批量删除企业角色记录
   *
   * @param args - 批量删除参数
   * @returns 删除操作结果
   */
  deleteMany(args: DeleteManyCompanyRoleArgs) {
    const where = args.where ? this.parseWhere(args.where) : undefined;
    const limit = args.limit ? args.limit : undefined;
    return this.db.companyRole.deleteMany({ where, limit });
  }
}
