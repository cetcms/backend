import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  MediaFolder,
  MediaFolderCreateInput,
  MediaFolderOrderByWithRelationInput,
  MediaFolderUpdateInput,
  MediaFolderWhereInput,
  MediaFolderWhereUniqueInput,
  CreateOneMediaFolderArgs,
  DeleteManyMediaFolderArgs,
  DeleteOneMediaFolderArgs,
  FindFirstMediaFolderArgs,
  FindManyMediaFolderArgs,
  FindUniqueMediaFolderArgs,
  UpdateOneMediaFolderArgs,
  UpsertOneMediaFolderArgs,
} from 'src/generated/graphql';
import {
  MediaFolderCreateInputObjectZodSchema,
  MediaFolderIncludeObjectZodSchema,
  MediaFolderOrderByWithRelationInputObjectZodSchema,
  MediaFolderUpdateInputObjectZodSchema,
  MediaFolderWhereInputObjectZodSchema,
  MediaFolderWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 媒体文件夹数据访问抽象类
 *
 * 该抽象类提供了对媒体文件夹数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class MediaFolderAbstract {
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
  protected abstract handleParsedData<T extends Prisma.MediaFolderCreateInput | Prisma.MediaFolderUpdateInput>(
    input: T
  ): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.MediaFolderInclude = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.MediaFolderInclude) {
    this.include = MediaFolderIncludeObjectZodSchema.parse(include) as Prisma.MediaFolderInclude;
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
  private parseWhere(where: MediaFolderWhereInput) {
    return MediaFolderWhereInputObjectZodSchema.parse(where) as unknown as Prisma.MediaFolderWhereInput;
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
  private parseUniqueWhere(where: MediaFolderWhereUniqueInput) {
    return MediaFolderWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.MediaFolderWhereUniqueInput;
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
  private parseCreateData(data: MediaFolderCreateInput) {
    return MediaFolderCreateInputObjectZodSchema.parse(data) as unknown as Prisma.MediaFolderCreateInput;
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
  private parseUpdateData(data: MediaFolderUpdateInput) {
    return MediaFolderUpdateInputObjectZodSchema.parse(data) as unknown as Prisma.MediaFolderUpdateInput;
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
  private parseOrderBy(orderBy: MediaFolderOrderByWithRelationInput | MediaFolderOrderByWithRelationInput[]) {
    if (Array.isArray(orderBy)) {
      return z
        .array(MediaFolderOrderByWithRelationInputObjectZodSchema)
        .parse(orderBy) as unknown as Prisma.MediaFolderOrderByWithRelationInput[];
    }
    return MediaFolderOrderByWithRelationInputObjectZodSchema.parse(
      orderBy
    ) as unknown as Prisma.MediaFolderOrderByWithRelationInput;
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
  private parseManyOrFirstArgs(args: FindManyMediaFolderArgs | FindFirstMediaFolderArgs) {
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
   * 查找唯一媒体文件夹记录
   *
   * 根据唯一条件查询单个媒体文件夹记录
   *
   * @param args - 查询参数
   * @returns 媒体文件夹记录或null
   */
  findUnique(args: FindUniqueMediaFolderArgs): PrismaPromise<MediaFolder | null> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    return this.db.mediaFolder.findUnique({ include, where });
  }

  /**
   * 查找第一个匹配的媒体文件夹记录
   *
   * 根据条件查询第一个匹配的媒体文件夹记录
   *
   * @param args - 查询参数
   * @returns 媒体文件夹记录或null
   */
  findFirst(args: FindFirstMediaFolderArgs): PrismaPromise<MediaFolder | null> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.mediaFolder.findFirst({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 查找多个媒体文件夹记录
   *
   * 根据条件查询多个媒体文件夹记录
   *
   * @param args - 查询参数
   * @returns 媒体文件夹记录数组
   */
  findMany(args: FindManyMediaFolderArgs): PrismaPromise<MediaFolder[]> {
    const { include, where, orderBy, skip, take, distinct, cursor } = this.parseManyOrFirstArgs(args);
    return this.db.mediaFolder.findMany({ include, where, orderBy, skip, take, distinct, cursor });
  }

  /**
   * 计算符合条件的媒体文件夹记录数量
   *
   * @param args - 查询参数
   * @returns 记录数量
   */
  count(args: FindManyMediaFolderArgs): PrismaPromise<number> {
    const where = args.where ? this.parseWhere(args.where) : undefined;
    return this.db.mediaFolder.count({ where });
  }

  /**
   * 创建媒体文件夹记录
   *
   * @param args - 创建参数
   * @returns 创建的媒体文件夹记录
   */
  create(args: CreateOneMediaFolderArgs): PrismaPromise<MediaFolder> {
    const include = this.getInclude();
    const data = this.parseCreateData(args.data);
    return this.db.mediaFolder.create({ include, data });
  }

  /**
   * 更新媒体文件夹记录
   *
   * @param args - 更新参数
   * @returns 更新后的媒体文件夹记录
   */
  update(args: UpdateOneMediaFolderArgs): PrismaPromise<MediaFolder> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    const data = this.parseUpdateData(args.data);
    return this.db.mediaFolder.update({ include, where, data });
  }

  /**
   * 更新或创建媒体文件夹记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的媒体文件夹记录
   */
  upsert(args: UpsertOneMediaFolderArgs): PrismaPromise<MediaFolder> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.mediaFolder.upsert({ include, where, create, update });
  }

  /**
   * 删除媒体文件夹记录
   *
   * @param args - 删除参数
   * @returns 删除的媒体文件夹记录
   */
  delete(args: DeleteOneMediaFolderArgs): PrismaPromise<MediaFolder> {
    const include = this.getInclude();
    const where = this.parseUniqueWhere(args.where);
    return this.db.mediaFolder.delete({ include, where });
  }

  /**
   * 批量删除媒体文件夹记录
   *
   * @param args - 批量删除参数
   * @returns 删除操作结果
   */
  deleteMany(args: DeleteManyMediaFolderArgs) {
    const where = args.where ? this.parseWhere(args.where) : undefined;
    const limit = args.limit ? args.limit : undefined;
    return this.db.mediaFolder.deleteMany({ where, limit });
  }
}
