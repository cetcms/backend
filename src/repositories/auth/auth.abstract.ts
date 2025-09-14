import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  Auth,
  AuthCreateInput,
  AuthOrderByWithRelationInput,
  AuthUpdateInput,
  AuthWhereInput,
  AuthWhereUniqueInput,
  CreateOneAuthArgs,
  DeleteManyAuthArgs,
  DeleteOneAuthArgs,
  FindFirstAuthArgs,
  FindManyAuthArgs,
  FindUniqueAuthArgs,
  UpdateOneAuthArgs,
  UpsertOneAuthArgs,
} from 'src/generated/graphql';
import {
  AuthCreateInputObjectZodSchema,
  AuthIncludeObjectZodSchema,
  AuthOrderByWithRelationInputObjectZodSchema,
  AuthUpdateInputObjectZodSchema,
  AuthWhereInputObjectZodSchema,
  AuthWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 认证数据访问抽象类
 *
 * 该抽象类提供了对认证数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class AuthAbstract {
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
  protected abstract handleParsedData<T extends Prisma.AuthCreateInput | Prisma.AuthUpdateInput>(input: T): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.AuthInclude = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.AuthInclude) {
    this.include = AuthIncludeObjectZodSchema.parse(include) as Prisma.AuthInclude;
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
  private parseWhere(where: AuthWhereInput) {
    return AuthWhereInputObjectZodSchema.parse(where) as unknown as Prisma.AuthWhereInput;
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
  private parseUniqueWhere(where: AuthWhereUniqueInput) {
    return AuthWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.AuthWhereUniqueInput;
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
  private parseCreateData(data: AuthCreateInput) {
    return AuthCreateInputObjectZodSchema.parse(data) as unknown as Prisma.AuthCreateInput;
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
  private parseUpdateData(data: AuthUpdateInput) {
    return AuthUpdateInputObjectZodSchema.parse(data) as unknown as Prisma.AuthUpdateInput;
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
  private parseOrderBy(orderBy: AuthOrderByWithRelationInput | AuthOrderByWithRelationInput[]) {
    if (Array.isArray(orderBy)) {
      return z
        .array(AuthOrderByWithRelationInputObjectZodSchema)
        .parse(orderBy) as unknown as Prisma.AuthOrderByWithRelationInput[];
    }
    return AuthOrderByWithRelationInputObjectZodSchema.parse(orderBy) as unknown as Prisma.AuthOrderByWithRelationInput;
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
  private parseManyOrFirstArgs(args: FindManyAuthArgs | FindFirstAuthArgs) {
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
   * 查找唯一认证记录
   *
   * 根据唯一条件查询单个认证记录
   *
   * @param args - 查询参数
   * @returns 认证记录或null
   */
  findUnique(args: FindUniqueAuthArgs): PrismaPromise<Auth | null> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    return this.db.auth.findUnique({ include, where });
  }

  /**
   * 查找第一个匹配的认证记录
   *
   * 根据条件查询第一个匹配的认证记录
   *
   * @param args - 查询参数
   * @returns 认证记录或null
   */
  findFirst(args: FindFirstAuthArgs): PrismaPromise<Auth | null> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.auth.findFirst({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 查找多个认证记录
   *
   * 根据条件查询多个认证记录
   *
   * @param args - 查询参数
   * @returns 认证记录数组
   */
  findMany(args: FindManyAuthArgs): PrismaPromise<Auth[]> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.auth.findMany({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 计算符合条件的认证记录数量
   *
   * @param args - 查询参数
   * @returns 记录数量
   */
  count(args: FindManyAuthArgs): PrismaPromise<number> {
    const where = args.where ? this.parseWhere(args.where) : undefined;
    return this.db.auth.count({ where });
  }

  /**
   * 创建认证记录
   *
   * @param args - 创建参数
   * @returns 创建的认证记录
   */
  create(args: CreateOneAuthArgs): PrismaPromise<Auth> {
    const include = this.getInclude();
    const data = this.parseCreateData(args.data);
    return this.db.auth.create({ include, data });
  }

  /**
   * 更新认证记录
   *
   * @param args - 更新参数
   * @returns 更新后的认证记录
   */
  update(args: UpdateOneAuthArgs): PrismaPromise<Auth> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    const data = this.parseUpdateData(args.data);
    return this.db.auth.update({ include, where, data });
  }

  /**
   * 更新或创建认证记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的认证记录
   */
  upsert(args: UpsertOneAuthArgs): PrismaPromise<Auth> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.auth.upsert({ include, where, create, update });
  }

  /**
   * 删除认证记录
   *
   * @param args - 删除参数
   * @returns 删除的认证记录
   */
  delete(args: DeleteOneAuthArgs): PrismaPromise<Auth> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    return this.db.auth.delete({ include, where });
  }

  /**
   * 批量删除认证记录
   *
   * @param args - 批量删除参数
   * @returns 删除操作结果
   */
  deleteMany(args: DeleteManyAuthArgs) {
    const where = args.where ? this.parseWhere(args.where) : undefined;
    const limit = args.limit ? args.limit : undefined;
    return this.db.auth.deleteMany({ where, limit });
  }
}
