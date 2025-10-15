import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  Admin,
  AdminCreateInput,
  AdminOrderByWithRelationInput,
  AdminUpdateInput,
  AdminWhereInput,
  AdminWhereUniqueInput,
  CreateOneAdminArgs,
  DeleteManyAdminArgs,
  DeleteOneAdminArgs,
  FindFirstAdminArgs,
  FindManyAdminArgs,
  FindUniqueAdminArgs,
  Owner,
  UpdateOneAdminArgs,
  UpsertOneAdminArgs,
} from 'src/generated/graphql';
import {
  AdminCreateInputObjectZodSchema,
  AdminIncludeObjectZodSchema,
  AdminOrderByWithRelationInputObjectZodSchema,
  AdminSelectObjectZodSchema,
  AdminUpdateInputObjectZodSchema,
  AdminWhereInputObjectZodSchema,
  AdminWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 管理员数据访问抽象类
 *
 * 该抽象类提供了对管理员数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class AdminAbstract {
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
  protected abstract handleParsedData<T extends Prisma.AdminCreateInput | Prisma.AdminUpdateInput>(input: T): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.AdminInclude = {};

  /**
   * 选择字段配置
   *
   * 用于指定查询时需要选择的字段
   */
  protected select: Prisma.AdminSelect = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.AdminInclude) {
    this.include = AdminIncludeObjectZodSchema.parse(include) as Prisma.AdminInclude;
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
  setSelect(select?: Prisma.AdminSelect) {
    this.select = AdminSelectObjectZodSchema.parse(select) as Prisma.AdminSelect;
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
  private parseWhere(where: AdminWhereInput) {
    return AdminWhereInputObjectZodSchema.parse(where) as unknown as Prisma.AdminWhereInput;
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
  private parseUniqueWhere(where: AdminWhereUniqueInput) {
    return AdminWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.AdminWhereUniqueInput;
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
  private parseCreateData(data: AdminCreateInput) {
    const result = AdminCreateInputObjectZodSchema.omit({
      auths: true,
      companies: true,
      logs: true,
      mediaFiles: true,
      mediaFolders: true,
      notifications: true,
      notificationRecipients: true,
    }).parse(data) as unknown as Prisma.AdminCreateInput;
    result.mediaFolders = {
      create: { name: 'root', path: '/', owner: Owner.Admin },
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
  private parseUpdateData(data: AdminUpdateInput) {
    return AdminUpdateInputObjectZodSchema.omit({
      auths: true,
      companies: true,
      logs: true,
      mediaFiles: true,
      mediaFolders: true,
      notifications: true,
      notificationRecipients: true,
    }).parse(data) as unknown as Prisma.AdminUpdateInput;
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
  private parseOrderBy(orderBy: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]) {
    if (Array.isArray(orderBy)) {
      return z
        .array(AdminOrderByWithRelationInputObjectZodSchema)
        .parse(orderBy) as unknown as Prisma.AdminOrderByWithRelationInput[];
    }
    return AdminOrderByWithRelationInputObjectZodSchema.parse(
      orderBy
    ) as unknown as Prisma.AdminOrderByWithRelationInput;
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
  private parseManyOrFirstArgs<T extends FindManyAdminArgs | FindFirstAdminArgs>(args: T) {
    return {
      ...args,
      where: args.where ? this.parseWhere(args.where) : undefined,
      orderBy: args.orderBy ? this.parseOrderBy(args.orderBy) : undefined,
      cursor: args.cursor ? this.parseUniqueWhere(args.cursor) : undefined,
    };
  }

  /**
   * 查找唯一管理员记录
   *
   * 根据唯一条件查询单个管理员记录
   *
   * @returns 管理员记录或null
   * @param where
   */
  findUnique(where: FindUniqueAdminArgs['where']): PrismaPromise<Admin | null> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.admin.findUnique({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 查找第一个匹配的管理员记录
   *
   * 根据条件查询第一个匹配的管理员记录
   *
   * @param args - 查询参数
   * @returns 管理员记录或null
   */
  findFirst(args: FindFirstAdminArgs): PrismaPromise<Admin | null> {
    args = this.parseManyOrFirstArgs(args);
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.admin.findFirst({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      ...args,
    });
  }

  /**
   * 查找多个管理员记录
   *
   * 根据条件查询多个管理员记录
   *
   * @param args - 查询参数
   * @returns 管理员记录数组
   */
  findMany(args: FindManyAdminArgs): PrismaPromise<Admin[]> {
    args = this.parseManyOrFirstArgs(args);
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.admin.findMany({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      ...args,
    });
  }

  /**
   * 计算符合条件的管理员记录数量
   *
   * @param where
   * @returns 记录数量
   */
  count(where?: FindManyAdminArgs['where']): PrismaPromise<number> {
    return this.db.admin.count({
      where: where ? this.parseWhere(where) : undefined,
    });
  }

  /**
   * 创建管理员记录
   *
   * @param data - 创建数据
   * @returns 创建的管理员记录
   */
  create(data: CreateOneAdminArgs['data']): PrismaPromise<Admin> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.admin.create({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      data: this.parseCreateData(data),
    });
  }

  /**
   * 更新管理员记录
   *
   * @param where
   * @param data
   * @returns 更新后的管理员记录
   */
  update(where: UpdateOneAdminArgs['where'], data: UpdateOneAdminArgs['data']): PrismaPromise<Admin> {
    const include = this.getInclude();
    const select = this.getSelect();
    const update = this.handleParsedData(this.parseUpdateData(data));
    return this.db.admin.update({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
      data: update,
    });
  }

  /**
   * 更新或创建管理员记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的管理员记录
   */
  upsert(args: UpsertOneAdminArgs): PrismaPromise<Admin> {
    const include = this.getInclude();
    const select = this.getSelect();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.admin.upsert({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where,
      create,
      update,
    });
  }

  /**
   * 删除管理员记录
   *
   * @param where - 删除参数
   * @returns 删除的管理员记录
   */
  delete(where: DeleteOneAdminArgs['where']): PrismaPromise<Admin> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.admin.delete({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除管理员记录
   *
   * @param where
   * @param limit
   * @returns 删除操作结果
   */
  deleteMany(where?: DeleteManyAdminArgs['where'], limit?: number) {
    return this.db.admin.deleteMany({
      where: where ? this.parseWhere(where) : undefined,
      limit,
    });
  }
}
