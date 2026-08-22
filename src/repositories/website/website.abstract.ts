import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database';
import {
  CreateOneWebsiteArgs,
  DeleteManyWebsiteArgs,
  DeleteOneWebsiteArgs,
  FindFirstWebsiteArgs,
  FindManyWebsiteArgs,
  FindUniqueWebsiteArgs,
  UpdateOneWebsiteArgs,
  UpsertOneWebsiteArgs,
  Website,
  WebsiteCreateInput,
  WebsiteOrderByWithRelationInput,
  WebsiteUpdateInput,
  WebsiteWhereInput,
  WebsiteWhereUniqueInput,
} from 'src/generated/graphql';
import { Prisma } from 'src/generated/prisma/client';
import {
  WebsiteCreateInputObjectZodSchema,
  WebsiteIncludeObjectZodSchema,
  WebsiteOrderByWithRelationInputObjectZodSchema,
  WebsiteSelectObjectZodSchema,
  WebsiteUpdateInputObjectZodSchema,
  WebsiteWhereInputObjectZodSchema,
  WebsiteWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 网站数据访问抽象类
 *
 * 该抽象类提供了对网站数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class WebsiteAbstract {
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
  protected abstract handleParsedData<T extends Prisma.WebsiteCreateInput | Prisma.WebsiteUpdateInput>(input: T): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.WebsiteInclude = {};

  /**
   * 选择字段配置
   *
   * 用于指定查询时需要选择的字段
   */
  protected select: Prisma.WebsiteSelect = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.WebsiteInclude) {
    this.include = WebsiteIncludeObjectZodSchema.parse(include) as Prisma.WebsiteInclude;
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
   * 设置选择字段
   *
   * 设置查询时需要选择的字段
   *
   * @param select - 选择字段配置对象
   * @returns 当前实例，支持链式调用
   */
  setSelect(select?: Prisma.WebsiteSelect) {
    this.select = WebsiteSelectObjectZodSchema.parse(select) as Prisma.WebsiteSelect;
    return this;
  }

  /**
   * 获取选择字段配置
   *
   * @returns 当前设置的选择字段配置
   */
  getSelect() {
    return this.select;
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
  private parseWhere(where: WebsiteWhereInput) {
    return WebsiteWhereInputObjectZodSchema.parse(where) as unknown as Prisma.WebsiteWhereInput;
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
  private parseUniqueWhere(where: WebsiteWhereUniqueInput) {
    return WebsiteWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.WebsiteWhereUniqueInput;
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
  private parseCreateData(data: WebsiteCreateInput) {
    return WebsiteCreateInputObjectZodSchema.parse(data) as unknown as Prisma.WebsiteCreateInput;
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
  private parseUpdateData(data: WebsiteUpdateInput) {
    return WebsiteUpdateInputObjectZodSchema.parse(data) as unknown as Prisma.WebsiteUpdateInput;
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
  private parseOrderBy(orderBy: WebsiteOrderByWithRelationInput | WebsiteOrderByWithRelationInput[]) {
    if (!Array.isArray(orderBy)) {
      orderBy = [orderBy];
    }
    return z
      .array(WebsiteOrderByWithRelationInputObjectZodSchema)
      .parse(orderBy) as unknown as Prisma.WebsiteOrderByWithRelationInput[];
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
  private parseManyOrFirstArgs<T extends FindManyWebsiteArgs | FindFirstWebsiteArgs>(args: T) {
    return {
      ...args,
      where: args.where ? this.parseWhere(args.where) : undefined,
      orderBy: args.orderBy ? this.parseOrderBy(args.orderBy) : undefined,
      cursor: args.cursor ? this.parseUniqueWhere(args.cursor) : undefined,
    };
  }

  /**
   * 查找唯一网站记录
   *
   * 根据唯一条件查询单个网站记录
   *
   * @param where - 查询条件
   * @returns 网站记录或null
   */
  findUnique(where: FindUniqueWebsiteArgs['where']): Prisma.PrismaPromise<Website | null> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.website.findUnique({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 查找第一个匹配的网站记录
   *
   * 根据条件查询第一个匹配的网站记录
   *
   * @param args - 查询参数
   * @returns 网站记录或null
   */
  findFirst(args: FindFirstWebsiteArgs): Prisma.PrismaPromise<Website | null> {
    args = this.parseManyOrFirstArgs(args);
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.website.findFirst({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      ...args,
    });
  }

  /**
   * 查找多个网站记录
   *
   * 根据条件查询多个网站记录
   *
   * @param args - 查询参数
   * @returns 网站记录数组
   */
  findMany(args: FindManyWebsiteArgs): Prisma.PrismaPromise<Website[]> {
    args = this.parseManyOrFirstArgs(args);
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.website.findMany({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      ...args,
    });
  }

  /**
   * 计算符合条件的网站记录数量
   *
   * @param where - 查询条件
   * @returns 记录数量
   */
  count(where?: FindManyWebsiteArgs['where']): Prisma.PrismaPromise<number> {
    return this.db.website.count({
      where: where ? this.parseWhere(where) : undefined,
    });
  }

  /**
   * 创建网站记录
   *
   * @param data - 创建数据
   * @returns 创建的网站记录
   */
  create(data: CreateOneWebsiteArgs['data']): Prisma.PrismaPromise<Website> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.website.create({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      data: this.parseCreateData(data),
    });
  }

  /**
   * 更新网站记录
   *
   * @param where - 更新条件
   * @param data - 更新数据
   * @returns 更新后的网站记录
   */
  update(where: UpdateOneWebsiteArgs['where'], data: UpdateOneWebsiteArgs['data']): Prisma.PrismaPromise<Website> {
    const include = this.getInclude();
    const select = this.getSelect();
    const update = this.handleParsedData(this.parseUpdateData(data));
    return this.db.website.update({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
      data: update,
    });
  }

  /**
   * 更新或创建网站记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的网站记录
   */
  upsert(args: UpsertOneWebsiteArgs): Prisma.PrismaPromise<Website> {
    const include = this.getInclude();
    const select = this.getSelect();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.website.upsert({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where,
      create,
      update,
    });
  }

  /**
   * 删除网站记录
   *
   * @param where - 删除条件
   * @returns 删除的网站记录
   */
  delete(where: DeleteOneWebsiteArgs['where']): Prisma.PrismaPromise<Website> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.website.delete({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除网站记录
   *
   * @param where - 删除条件
   * @param limit - 限制删除数量
   * @returns 删除操作结果
   */
  deleteMany(where?: DeleteManyWebsiteArgs['where'], limit?: number) {
    return this.db.website.deleteMany({
      where: where ? this.parseWhere(where) : undefined,
      limit,
    });
  }
}
