import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  AdminCompany,
  AdminCompanyCreateInput,
  AdminCompanyOrderByWithRelationInput,
  AdminCompanyUpdateInput,
  AdminCompanyWhereInput,
  AdminCompanyWhereUniqueInput,
  CreateOneAdminCompanyArgs,
  DeleteManyAdminCompanyArgs,
  DeleteOneAdminCompanyArgs,
  FindFirstAdminCompanyArgs,
  FindManyAdminCompanyArgs,
  FindUniqueAdminCompanyArgs,
  UpdateOneAdminCompanyArgs,
  UpsertOneAdminCompanyArgs,
} from 'src/generated/graphql';
import {
  AdminCompanyCreateInputObjectZodSchema,
  AdminCompanyIncludeObjectZodSchema,
  AdminCompanyOrderByWithRelationInputObjectZodSchema,
  AdminCompanyUpdateInputObjectZodSchema,
  AdminCompanyWhereInputObjectZodSchema,
  AdminCompanyWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 管理员企业关联数据访问抽象类
 *
 * 该抽象类提供了对管理员企业关联数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class AdminCompanyAbstract {
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
  protected abstract handleParsedData<T extends Prisma.AdminCompanyCreateInput | Prisma.AdminCompanyUpdateInput>(
    input: T
  ): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.AdminCompanyInclude = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.AdminCompanyInclude) {
    this.include = AdminCompanyIncludeObjectZodSchema.parse(include) as Prisma.AdminCompanyInclude;
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
  private parseWhere(where: AdminCompanyWhereInput) {
    return AdminCompanyWhereInputObjectZodSchema.parse(where) as unknown as Prisma.AdminCompanyWhereInput;
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
  private parseUniqueWhere(where: AdminCompanyWhereUniqueInput) {
    return AdminCompanyWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.AdminCompanyWhereUniqueInput;
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
  private parseCreateData(data: AdminCompanyCreateInput) {
    return AdminCompanyCreateInputObjectZodSchema.parse(data) as unknown as Prisma.AdminCompanyCreateInput;
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
  private parseUpdateData(data: AdminCompanyUpdateInput) {
    return AdminCompanyUpdateInputObjectZodSchema.parse(data) as unknown as Prisma.AdminCompanyUpdateInput;
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
  private parseOrderBy(orderBy: AdminCompanyOrderByWithRelationInput | AdminCompanyOrderByWithRelationInput[]) {
    if (Array.isArray(orderBy)) {
      return z
        .array(AdminCompanyOrderByWithRelationInputObjectZodSchema)
        .parse(orderBy) as unknown as Prisma.AdminCompanyOrderByWithRelationInput[];
    }
    return AdminCompanyOrderByWithRelationInputObjectZodSchema.parse(
      orderBy
    ) as unknown as Prisma.AdminCompanyOrderByWithRelationInput;
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
  private parseManyOrFirstArgs(args: FindManyAdminCompanyArgs | FindFirstAdminCompanyArgs) {
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
   * 查找唯一管理员企业关联记录
   *
   * 根据唯一条件查询单个管理员企业关联记录
   *
   * @param where - 查询条件
   * @returns 管理员企业关联记录或null
   */
  findUnique(where: FindUniqueAdminCompanyArgs['where']): PrismaPromise<AdminCompany | null> {
    return this.db.adminCompany.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.getInclude(),
    });
  }

  /**
   * 查找第一个匹配的管理员企业关联记录
   *
   * 根据条件查询第一个匹配的管理员企业关联记录
   *
   * @param args - 查询参数
   * @returns 管理员企业关联记录或null
   */
  findFirst(args: FindFirstAdminCompanyArgs): PrismaPromise<AdminCompany | null> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.adminCompany.findFirst({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 查找多个管理员企业关联记录
   *
   * 根据条件查询多个管理员企业关联记录
   *
   * @param args - 查询参数
   * @returns 管理员企业关联记录数组
   */
  findMany(args: FindManyAdminCompanyArgs): PrismaPromise<AdminCompany[]> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.adminCompany.findMany({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 计算符合条件的管理员企业关联记录数量
   *
   * @param where - 查询条件
   * @returns 记录数量
   */
  count(where?: FindManyAdminCompanyArgs['where']): PrismaPromise<number> {
    return this.db.adminCompany.count({
      where: where ? this.parseWhere(where) : undefined,
    });
  }

  /**
   * 创建管理员企业关联记录
   *
   * @param data - 创建数据
   * @returns 创建的管理员企业关联记录
   */
  create(data: CreateOneAdminCompanyArgs['data']): PrismaPromise<AdminCompany> {
    return this.db.adminCompany.create({
      include: this.getInclude(),
      data: this.parseCreateData(data),
    });
  }

  /**
   * 更新管理员企业关联记录
   *
   * @param where - 更新条件
   * @param data - 更新数据
   * @returns 更新后的管理员企业关联记录
   */
  update(
    where: UpdateOneAdminCompanyArgs['where'],
    data: UpdateOneAdminCompanyArgs['data']
  ): PrismaPromise<AdminCompany> {
    return this.db.adminCompany.update({
      include: this.getInclude(),
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(data),
    });
  }

  /**
   * 更新或创建管理员企业关联记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的管理员企业关联记录
   */
  upsert(args: UpsertOneAdminCompanyArgs): PrismaPromise<AdminCompany> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.adminCompany.upsert({ include, where, create, update });
  }

  /**
   * 删除管理员企业关联记录
   *
   * @param where - 删除条件
   * @returns 删除的管理员企业关联记录
   */
  delete(where: DeleteOneAdminCompanyArgs['where']): PrismaPromise<AdminCompany> {
    return this.db.adminCompany.delete({ where: this.parseUniqueWhere(where), include: this.getInclude() });
  }

  /**
   * 批量删除管理员企业关联记录
   *
   * @param where - 删除条件
   * @param limit - 限制删除数量
   * @returns 删除操作结果
   */
  deleteMany(where?: DeleteManyAdminCompanyArgs['where'], limit?: number) {
    return this.db.adminCompany.deleteMany({
      where: where ? this.parseWhere(where) : undefined,
      limit,
    });
  }
}
