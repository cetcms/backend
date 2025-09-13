import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { CreateMediaFolderInput, UpdateMediaFolderInput } from 'src/generated/dto';
import {
  MediaFolderWhereInput,
  MediaFolderWhereUniqueInput,
  MediaFolderOrderByWithRelationInput,
} from 'src/generated/graphql/media-folder';
import {
  MediaFolderCreateInputObjectZodSchema,
  MediaFolderUpdateInputObjectSchema,
  MediaFolderWhereInputObjectSchema,
  MediaFolderWhereUniqueInputObjectSchema,
} from 'src/generated/schemas';

type PickWhereUniqueFields = 'id';

/**
 * 媒体文件夹数据访问层
 * 提供对媒体文件夹的完整 CRUD 操作
 *
 * @description 该仓库类封装了所有与媒体文件夹相关的数据库操作，
 * 包括查询、创建、更新、删除等功能，并提供了分页查询和批量操作的支持。
 * 支持按路径、所有者、父子关系等多维度查询和管理。
 */
@Injectable()
export class MediaFolderRepository {
  constructor(private readonly db: DatabaseService) {}

  /** 关联查询配置，用于指定查询时需要包含的关联数据 */
  private include: Prisma.MediaFolderInclude = {};

  /**
   * 设置关联查询配置
   * @param include - Prisma 关联查询配置对象
   */
  setInclude(include: Prisma.MediaFolderInclude) {
    this.include = include;
    return this;
  }

  /**
   * 处理输入数据
   * @param input - 输入数据
   */
  private handleInputData(input: CreateMediaFolderInput | UpdateMediaFolderInput) {
    // 此repository暂时不需要特殊处理输入数据
    return input;
  }

  /**
   * 解析创建数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 创建媒体文件夹的输入数据
   * @returns 解析后的创建数据
   */
  private parseCreateData(input: CreateMediaFolderInput) {
    return MediaFolderCreateInputObjectZodSchema.omit({
      parent: true,
      children: true,
      company: true,
      admin: true,
      user: true,
      files: true,
    }).parse(input) as unknown as Prisma.MediaFolderCreateInput;
  }

  /**
   * 解析更新数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 更新媒体文件夹的输入数据
   * @returns 解析后的更新数据
   */
  private parseUpdateData(input: UpdateMediaFolderInput) {
    return MediaFolderUpdateInputObjectSchema.parse(input) as unknown as Prisma.MediaFolderUpdateInput;
  }

  /**
   * 解析查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 查询条件
   * @returns 解析后的查询条件
   */
  private parseManyWhere(where: MediaFolderWhereInput) {
    return MediaFolderWhereInputObjectSchema.parse(where) as unknown as Prisma.MediaFolderWhereInput;
  }

  /**
   * 解析唯一查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 唯一查询条件
   * @returns 解析后的唯一查询条件
   */
  private parseUniqueWhere(where: MediaFolderWhereUniqueInput) {
    return MediaFolderWhereUniqueInputObjectSchema.parse(where) as unknown as Prisma.MediaFolderWhereUniqueInput;
  }

  /**
   * 根据文件夹名称查找媒体文件夹
   * @param name - 文件夹名称
   * @returns 匹配的媒体文件夹记录或 null
   */
  findByName(name: string) {
    return this.findFirst({ name: { equals: name } });
  }

  /**
   * 根据路径查找媒体文件夹
   * @param path - 文件夹路径
   * @returns 匹配的媒体文件夹记录或 null
   */
  findByPath(path: string) {
    return this.findFirst({ path: { equals: path } });
  }

  /**
   * 根据所有者 ID 和类型查找媒体文件夹
   * @param ownerId - 所有者唯一标识符
   * @param ownerType - 所有者类型
   * @returns 匹配的媒体文件夹记录列表
   */
  findByOwnerIdAndType(ownerId: string, ownerType: 'Admin' | 'User') {
    return this.findMany({
      ownerId: { equals: ownerId },
      ownerType: { equals: ownerType },
    });
  }

  /**
   * 根据父文件夹 ID 查找子文件夹
   * @param parentId - 父文件夹唯一标识符
   * @returns 该父文件夹下的所有子文件夹列表
   */
  findByParentId(parentId: string) {
    return this.findMany({ parentId: { equals: parentId } });
  }

  /**
   * 查找根文件夹（没有父文件夹的文件夹）
   * @returns 所有根文件夹列表
   */
  findRootFolders() {
    return this.findMany({ parentId: { equals: undefined } });
  }

  /**
   * 根据媒体文件夹 ID 查找记录
   * @param id - 媒体文件夹唯一标识符
   * @returns 匹配的媒体文件夹记录或 null
   */
  findById(id: string) {
    return this.findUnique({ id });
  }

  /**
   * 根据媒体文件夹 ID 更新记录
   * @param id - 媒体文件夹唯一标识符
   * @param input - 更新数据
   * @returns 更新后的媒体文件夹记录
   */
  updateById(id: string, input: UpdateMediaFolderInput) {
    return this.update({ id }, input);
  }

  /**
   * 分页查询媒体文件夹
   * @param skip - 跳过的记录数量（默认为 0）
   * @param take - 获取的记录数量（默认为 10）
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 包含总数和媒体文件夹列表的数组 [总数, 文件夹列表]
   */
  findWithPagination(
    skip: number = 0,
    take: number = 10,
    where?: MediaFolderWhereInput,
    orderBy?: MediaFolderOrderByWithRelationInput
  ) {
    return Promise.all([this.count(where), this.findMany(where, orderBy, skip, take)]);
  }

  /**
   * 查找第一个匹配的媒体文件夹
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 第一个匹配的媒体文件夹记录或 null
   */
  findFirst(where?: MediaFolderWhereInput, orderBy?: MediaFolderOrderByWithRelationInput) {
    const args: Prisma.MediaFolderFindFirstArgs = {
      include: this.include,
      orderBy,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.mediaFolder.findFirst(args);
  }

  /**
   * 根据唯一条件查找媒体文件夹
   * @param where - 唯一查询条件（只能使用 id）
   * @returns 匹配的媒体文件夹记录或 null
   */
  findUnique(where: Pick<MediaFolderWhereUniqueInput, PickWhereUniqueFields>) {
    return this.db.mediaFolder.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.include,
    });
  }

  /**
   * 查询多个媒体文件夹
   * @param where - 查询条件（可选）
   * @param orderBy - 排序条件（可选）
   * @param skip - 跳过的记录数量（可选）
   * @param take - 获取的记录数量（可选）
   * @returns 符合条件的媒体文件夹列表
   */
  findMany(where?: MediaFolderWhereInput, orderBy?: MediaFolderOrderByWithRelationInput, skip?: number, take?: number) {
    const args: Prisma.MediaFolderFindManyArgs = {
      include: this.include,
      orderBy,
      skip,
      take,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.mediaFolder.findMany(args);
  }

  /**
   * 统计符合条件的媒体文件夹数量
   * @param where - 查询条件（可选）
   * @returns 符合条件的记录总数
   */
  count(where?: MediaFolderWhereInput) {
    const args: Prisma.MediaFolderCountArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.mediaFolder.count(args);
  }

  /**
   * 更新媒体文件夹
   * @param where - 唯一查询条件（只能使用 id）
   * @param input - 更新数据
   * @returns 更新后的媒体文件夹记录
   */
  update(where: Pick<MediaFolderWhereUniqueInput, PickWhereUniqueFields>, input: UpdateMediaFolderInput) {
    this.handleInputData(input);
    return this.db.mediaFolder.update({
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(input),
    });
  }

  /**
   * 创建新的媒体文件夹
   * @param input - 创建媒体文件夹所需的数据
   * @returns 创建的媒体文件夹记录
   */
  create(input: CreateMediaFolderInput) {
    this.handleInputData(input);
    return this.db.mediaFolder.create({
      data: this.parseCreateData(input),
    });
  }

  /**
   * 创建或更新媒体文件夹（如果存在则更新，不存在则创建）
   * @param where - 唯一查询条件
   * @param input - 创建/更新数据
   * @returns 创建或更新后的媒体文件夹记录
   */
  upsert(where: Pick<MediaFolderWhereUniqueInput, PickWhereUniqueFields>, input: CreateMediaFolderInput) {
    this.handleInputData(input);
    const data = this.parseCreateData(input);
    return this.db.mediaFolder.upsert({
      where: this.parseUniqueWhere(where),
      update: data,
      create: data,
    });
  }

  /**
   * 删除媒体文件夹
   * @param where - 唯一查询条件（只能使用 id）
   * @returns 删除的媒体文件夹记录
   */
  delete(where: Pick<MediaFolderWhereUniqueInput, PickWhereUniqueFields>) {
    return this.db.mediaFolder.delete({
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除媒体文件夹
   * @param where - 查询条件（可选，不指定则删除所有记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteMany(where?: MediaFolderWhereInput) {
    const args: Prisma.MediaFolderDeleteManyArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.mediaFolder.deleteMany(args);
  }

  /**
   * 根据父文件夹 ID 删除该文件夹下的所有子文件夹
   * @param parentId - 父文件夹唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByParentId(parentId: string) {
    return this.deleteMany({ parentId: { equals: parentId } });
  }

  /**
   * 根据所有者 ID 和类型删除媒体文件夹
   * @param ownerId - 所有者唯一标识符
   * @param ownerType - 所有者类型
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByOwnerIdAndType(ownerId: string, ownerType: 'Admin' | 'User') {
    return this.deleteMany({
      ownerId: { equals: ownerId },
      ownerType: { equals: ownerType },
    });
  }
}
