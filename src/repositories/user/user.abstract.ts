import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  User,
  UserCreateInput,
  UserOrderByWithRelationInput,
  UserUpdateInput,
  UserWhereInput,
  UserWhereUniqueInput,
  CreateOneUserArgs,
  DeleteManyUserArgs,
  DeleteOneUserArgs,
  FindFirstUserArgs,
  FindManyUserArgs,
  FindUniqueUserArgs,
  UpdateOneUserArgs,
  UpsertOneUserArgs,
} from 'src/generated/graphql';
import {
  UserCreateInputObjectZodSchema,
  UserIncludeObjectZodSchema,
  UserOrderByWithRelationInputObjectZodSchema,
  UserSelectObjectZodSchema,
  UserUpdateInputObjectZodSchema,
  UserWhereInputObjectZodSchema,
  UserWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 用户数据访问抽象类
 *
 * 该抽象类提供了对用户数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class UserAbstract {
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
  protected abstract handleParsedData<T extends Prisma.UserCreateInput | Prisma.UserUpdateInput>(input: T): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.UserInclude = {};

  /**
   * 选择字段配置
   *
   * 用于指定查询时需要选择的字段
   */
  protected select: Prisma.UserSelect = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.UserInclude) {
    this.include = UserIncludeObjectZodSchema.parse(include) as Prisma.UserInclude;
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
  setSelect(select?: Prisma.UserSelect) {
    this.select = UserSelectObjectZodSchema.parse(select) as Prisma.UserSelect;
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
  private parseWhere(where: UserWhereInput) {
    return UserWhereInputObjectZodSchema.parse(where) as unknown as Prisma.UserWhereInput;
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
  private parseUniqueWhere(where: UserWhereUniqueInput) {
    return UserWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.UserWhereUniqueInput;
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
  private parseCreateData(data: UserCreateInput) {
    const result = UserCreateInputObjectZodSchema.omit({
      companies: true,
      auths: true,
      logs: true,
      mediaFiles: true,
      mediaFolders: true,
      notifications: true,
      notificationRecipients: true,
    }).parse(data) as unknown as Prisma.UserCreateInput;
    result.mediaFolders = {
      create: { name: 'root', path: '/' },
    };
    return result;
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
  private parseUpdateData(data: UserUpdateInput) {
    return UserUpdateInputObjectZodSchema.omit({
      companies: true,
      auths: true,
      logs: true,
      mediaFiles: true,
      mediaFolders: true,
      notifications: true,
      notificationRecipients: true,
    }).parse(data) as unknown as Prisma.UserUpdateInput;
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
  private parseOrderBy(orderBy: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]) {
    if (!Array.isArray(orderBy)) {
      orderBy = [orderBy];
    }
    return z
      .array(UserOrderByWithRelationInputObjectZodSchema)
      .parse(orderBy) as unknown as Prisma.UserOrderByWithRelationInput[];
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
  private parseManyOrFirstArgs<T extends FindManyUserArgs | FindFirstUserArgs>(args: T) {
    return {
      ...args,
      where: args.where ? this.parseWhere(args.where) : undefined,
      orderBy: args.orderBy ? this.parseOrderBy(args.orderBy) : undefined,
      cursor: args.cursor ? this.parseUniqueWhere(args.cursor) : undefined,
    };
  }

  /**
   * 查找唯一用户记录
   *
   * 根据唯一条件查询单个用户记录
   *
   * @param where - 查询条件
   * @returns 用户记录或null
   */
  findUnique(where: FindUniqueUserArgs['where']): PrismaPromise<User | null> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.user.findUnique({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 查找第一个匹配的用户记录
   *
   * 根据条件查询第一个匹配的用户记录
   *
   * @param args - 查询参数
   * @returns 用户记录或null
   */
  findFirst(args: FindFirstUserArgs): PrismaPromise<User | null> {
    args = this.parseManyOrFirstArgs(args);
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.user.findFirst({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      ...args,
    });
  }

  /**
   * 查找多个用户记录
   *
   * 根据条件查询多个用户记录
   *
   * @param args - 查询参数
   * @returns 用户记录数组
   */
  findMany(args: FindManyUserArgs): PrismaPromise<User[]> {
    args = this.parseManyOrFirstArgs(args);
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.user.findMany({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      ...args,
    });
  }

  /**
   * 计算符合条件的用户记录数量
   *
   * @param where - 查询条件
   * @returns 记录数量
   */
  count(where?: FindManyUserArgs['where']): PrismaPromise<number> {
    return this.db.user.count({
      where: where ? this.parseWhere(where) : undefined,
    });
  }

  /**
   * 创建用户记录
   *
   * @param data - 创建数据
   * @returns 创建的用户记录
   */
  create(data: CreateOneUserArgs['data']): PrismaPromise<User> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.user.create({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      data: this.parseCreateData(data),
    });
  }

  /**
   * 更新用户记录
   *
   * @param where - 更新条件
   * @param data - 更新数据
   * @returns 更新后的用户记录
   */
  update(where: UpdateOneUserArgs['where'], data: UpdateOneUserArgs['data']): PrismaPromise<User> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.user.update({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(data),
    });
  }

  /**
   * 更新或创建用户记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的用户记录
   */
  upsert(args: UpsertOneUserArgs): PrismaPromise<User> {
    const include = this.getInclude();
    const select = this.getSelect();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.user.upsert({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where,
      create,
      update,
    });
  }

  /**
   * 删除用户记录
   *
   * @param where - 删除条件
   * @returns 删除的用户记录
   */
  delete(where: DeleteOneUserArgs['where']): PrismaPromise<User> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.user.delete({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除用户记录
   *
   * @param where - 删除条件
   * @param limit - 限制删除数量
   * @returns 删除操作结果
   */
  deleteMany(where?: DeleteManyUserArgs['where'], limit?: number) {
    return this.db.user.deleteMany({
      where: where ? this.parseWhere(where) : undefined,
      limit,
    });
  }
}
