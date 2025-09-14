import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  RequestLog,
  RequestLogCreateInput,
  RequestLogOrderByWithRelationInput,
  RequestLogUpdateInput,
  RequestLogWhereInput,
  RequestLogWhereUniqueInput,
  CreateOneRequestLogArgs,
  DeleteManyRequestLogArgs,
  DeleteOneRequestLogArgs,
  FindFirstRequestLogArgs,
  FindManyRequestLogArgs,
  FindUniqueRequestLogArgs,
  UpdateOneRequestLogArgs,
  UpsertOneRequestLogArgs,
} from 'src/generated/graphql';
import {
  RequestLogCreateInputObjectZodSchema,
  RequestLogIncludeObjectZodSchema,
  RequestLogOrderByWithRelationInputObjectZodSchema,
  RequestLogUpdateInputObjectZodSchema,
  RequestLogWhereInputObjectZodSchema,
  RequestLogWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 请求日志数据访问抽象类
 *
 * 该抽象类提供了对请求日志数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class RequestLogAbstract {
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
  protected abstract handleParsedData<T extends Prisma.RequestLogCreateInput | Prisma.RequestLogUpdateInput>(
    input: T
  ): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.RequestLogInclude = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.RequestLogInclude) {
    this.include = RequestLogIncludeObjectZodSchema.parse(include) as Prisma.RequestLogInclude;
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
  private parseWhere(where: RequestLogWhereInput) {
    return RequestLogWhereInputObjectZodSchema.parse(where) as unknown as Prisma.RequestLogWhereInput;
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
  private parseUniqueWhere(where: RequestLogWhereUniqueInput) {
    return RequestLogWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.RequestLogWhereUniqueInput;
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
  private parseCreateData(data: RequestLogCreateInput) {
    return RequestLogCreateInputObjectZodSchema.parse(data) as unknown as Prisma.RequestLogCreateInput;
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
  private parseUpdateData(data: RequestLogUpdateInput) {
    return RequestLogUpdateInputObjectZodSchema.parse(data) as unknown as Prisma.RequestLogUpdateInput;
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
  private parseOrderBy(orderBy: RequestLogOrderByWithRelationInput | RequestLogOrderByWithRelationInput[]) {
    if (Array.isArray(orderBy)) {
      return z
        .array(RequestLogOrderByWithRelationInputObjectZodSchema)
        .parse(orderBy) as unknown as Prisma.RequestLogOrderByWithRelationInput[];
    }
    return RequestLogOrderByWithRelationInputObjectZodSchema.parse(
      orderBy
    ) as unknown as Prisma.RequestLogOrderByWithRelationInput;
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
  private parseManyOrFirstArgs(args: FindManyRequestLogArgs | FindFirstRequestLogArgs) {
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
   * 查找唯一请求日志记录
   *
   * 根据唯一条件查询单个请求日志记录
   *
   * @param where - 查询条件
   * @returns 请求日志记录或null
   */
  findUnique(where: FindUniqueRequestLogArgs['where']): PrismaPromise<RequestLog | null> {
    return this.db.requestLog.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.getInclude(),
    });
  }

  /**
   * 查找第一个匹配的请求日志记录
   *
   * 根据条件查询第一个匹配的请求日志记录
   *
   * @param args - 查询参数
   * @returns 请求日志记录或null
   */
  findFirst(args: FindFirstRequestLogArgs): PrismaPromise<RequestLog | null> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.requestLog.findFirst({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 查找多个请求日志记录
   *
   * 根据条件查询多个请求日志记录
   *
   * @param args - 查询参数
   * @returns 请求日志记录数组
   */
  findMany(args: FindManyRequestLogArgs): PrismaPromise<RequestLog[]> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.requestLog.findMany({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 计算符合条件的请求日志记录数量
   *
   * @param where - 查询条件
   * @returns 记录数量
   */
  count(where?: FindManyRequestLogArgs['where']): PrismaPromise<number> {
    return this.db.requestLog.count({
      where: where ? this.parseWhere(where) : undefined,
    });
  }

  /**
   * 创建请求日志记录
   *
   * @param data - 创建数据
   * @returns 创建的请求日志记录
   */
  create(data: CreateOneRequestLogArgs['data']): PrismaPromise<RequestLog> {
    return this.db.requestLog.create({
      include: this.getInclude(),
      data: this.parseCreateData(data),
    });
  }

  /**
   * 更新请求日志记录
   *
   * @param where - 更新条件
   * @param data - 更新数据
   * @returns 更新后的请求日志记录
   */
  update(where: UpdateOneRequestLogArgs['where'], data: UpdateOneRequestLogArgs['data']): PrismaPromise<RequestLog> {
    return this.db.requestLog.update({
      include: this.getInclude(),
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(data),
    });
  }

  /**
   * 更新或创建请求日志记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的请求日志记录
   */
  upsert(args: UpsertOneRequestLogArgs): PrismaPromise<RequestLog> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.requestLog.upsert({ include, where, create, update });
  }

  /**
   * 删除请求日志记录
   *
   * @param where - 删除条件
   * @returns 删除的请求日志记录
   */
  delete(where: DeleteOneRequestLogArgs['where']): PrismaPromise<RequestLog> {
    return this.db.requestLog.delete({ where: this.parseUniqueWhere(where), include: this.getInclude() });
  }

  /**
   * 批量删除请求日志记录
   *
   * @param where - 删除条件
   * @param limit - 限制删除数量
   * @returns 删除操作结果
   */
  deleteMany(where?: DeleteManyRequestLogArgs['where'], limit?: number) {
    return this.db.requestLog.deleteMany({
      where: where ? this.parseWhere(where) : undefined,
      limit,
    });
  }
}
