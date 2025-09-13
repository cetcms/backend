import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { CreateMediaFileInput, UpdateMediaFileInput } from 'src/generated/dto';
import {
  MediaFileWhereInput,
  MediaFileWhereUniqueInput,
  MediaFileOrderByWithRelationInput,
} from 'src/generated/graphql/media-file';
import {
  MediaFileCreateInputObjectZodSchema,
  MediaFileUpdateInputObjectSchema,
  MediaFileWhereInputObjectSchema,
  MediaFileWhereUniqueInputObjectSchema,
} from 'src/generated/schemas';

type PickWhereUniqueFields = 'id';

/**
 * 媒体文件数据访问层
 * 提供对媒体文件的完整 CRUD 操作
 *
 * @description 该仓库类封装了所有与媒体文件相关的数据库操作，
 * 包括查询、创建、更新、删除等功能，并提供了分页查询和批量操作的支持。
 * 支持按文件名、所有者、文件夹等多维度查询和管理。
 */
@Injectable()
export class MediaFileRepository {
  constructor(private readonly db: DatabaseService) {}

  /** 关联查询配置，用于指定查询时需要包含的关联数据 */
  private include: Prisma.MediaFileInclude = {};

  /**
   * 设置关联查询配置
   * @param include - Prisma 关联查询配置对象
   */
  setInclude(include: Prisma.MediaFileInclude) {
    this.include = include;
    return this;
  }

  /**
   * 处理输入数据
   * @param input - 输入数据
   */
  private handleInputData(input: CreateMediaFileInput | UpdateMediaFileInput) {
    // 此repository暂时不需要特殊处理输入数据
    return input;
  }

  /**
   * 解析创建数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 创建媒体文件的输入数据
   * @returns 解析后的创建数据
   */
  private parseCreateData(input: CreateMediaFileInput) {
    return MediaFileCreateInputObjectZodSchema.omit({
      folder: true,
      company: true,
      admin: true,
      user: true,
    }).parse(input) as unknown as Prisma.MediaFileCreateInput;
  }

  /**
   * 解析更新数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 更新媒体文件的输入数据
   * @returns 解析后的更新数据
   */
  private parseUpdateData(input: UpdateMediaFileInput) {
    return MediaFileUpdateInputObjectSchema.parse(input) as unknown as Prisma.MediaFileUpdateInput;
  }

  /**
   * 解析查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 查询条件
   * @returns 解析后的查询条件
   */
  private parseManyWhere(where: MediaFileWhereInput) {
    return MediaFileWhereInputObjectSchema.parse(where) as unknown as Prisma.MediaFileWhereInput;
  }

  /**
   * 解析唯一查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 唯一查询条件
   * @returns 解析后的唯一查询条件
   */
  private parseUniqueWhere(where: MediaFileWhereUniqueInput) {
    return MediaFileWhereUniqueInputObjectSchema.parse(where) as unknown as Prisma.MediaFileWhereUniqueInput;
  }

  /**
   * 根据文件名查找媒体文件
   * @param fileName - 文件名
   * @returns 匹配的媒体文件记录或 null
   */
  findByFileName(fileName: string) {
    return this.findFirst({ fileName: { equals: fileName } });
  }

  /**
   * 根据文件哈希查找媒体文件
   * @param fileHash - 文件哈希值
   * @returns 匹配的媒体文件记录或 null
   */
  findByFileHash(fileHash: string) {
    return this.findFirst({ fileHash: { equals: fileHash } });
  }

  /**
   * 根据所有者 ID 和类型查找媒体文件
   * @param ownerId - 所有者唯一标识符
   * @param ownerType - 所有者类型
   * @returns 匹配的媒体文件记录列表
   */
  findByOwnerIdAndType(ownerId: string, ownerType: 'Admin' | 'User') {
    return this.findMany({
      ownerId: { equals: ownerId },
      ownerType: { equals: ownerType },
    });
  }

  /**
   * 根据文件夹 ID 查找媒体文件
   * @param folderId - 文件夹唯一标识符
   * @returns 该文件夹下的所有媒体文件列表
   */
  findByFolderId(folderId: string) {
    return this.findMany({ folderId: { equals: folderId } });
  }

  /**
   * 根据媒体文件 ID 查找记录
   * @param id - 媒体文件唯一标识符
   * @returns 匹配的媒体文件记录或 null
   */
  findById(id: string) {
    return this.findUnique({ id });
  }

  /**
   * 根据媒体文件 ID 更新记录
   * @param id - 媒体文件唯一标识符
   * @param input - 更新数据
   * @returns 更新后的媒体文件记录
   */
  updateById(id: string, input: UpdateMediaFileInput) {
    return this.update({ id }, input);
  }

  /**
   * 分页查询媒体文件
   * @param skip - 跳过的记录数量（默认为 0）
   * @param take - 获取的记录数量（默认为 10）
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 包含总数和媒体文件列表的数组 [总数, 文件列表]
   */
  findWithPagination(
    skip: number = 0,
    take: number = 10,
    where?: MediaFileWhereInput,
    orderBy?: MediaFileOrderByWithRelationInput
  ) {
    return Promise.all([this.count(where), this.findMany(where, orderBy, skip, take)]);
  }

  /**
   * 查找第一个匹配的媒体文件
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 第一个匹配的媒体文件记录或 null
   */
  findFirst(where?: MediaFileWhereInput, orderBy?: MediaFileOrderByWithRelationInput) {
    const args: Prisma.MediaFileFindFirstArgs = {
      include: this.include,
      orderBy,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.mediaFile.findFirst(args);
  }

  /**
   * 根据唯一条件查找媒体文件
   * @param where - 唯一查询条件（只能使用 id）
   * @returns 匹配的媒体文件记录或 null
   */
  findUnique(where: Pick<MediaFileWhereUniqueInput, PickWhereUniqueFields>) {
    return this.db.mediaFile.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.include,
    });
  }

  /**
   * 查询多个媒体文件
   * @param where - 查询条件（可选）
   * @param orderBy - 排序条件（可选）
   * @param skip - 跳过的记录数量（可选）
   * @param take - 获取的记录数量（可选）
   * @returns 符合条件的媒体文件列表
   */
  findMany(where?: MediaFileWhereInput, orderBy?: MediaFileOrderByWithRelationInput, skip?: number, take?: number) {
    const args: Prisma.MediaFileFindManyArgs = {
      include: this.include,
      orderBy,
      skip,
      take,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.mediaFile.findMany(args);
  }

  /**
   * 统计符合条件的媒体文件数量
   * @param where - 查询条件（可选）
   * @returns 符合条件的记录总数
   */
  count(where?: MediaFileWhereInput) {
    const args: Prisma.MediaFileCountArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.mediaFile.count(args);
  }

  /**
   * 更新媒体文件
   * @param where - 唯一查询条件（只能使用 id）
   * @param input - 更新数据
   * @returns 更新后的媒体文件记录
   */
  update(where: Pick<MediaFileWhereUniqueInput, PickWhereUniqueFields>, input: UpdateMediaFileInput) {
    this.handleInputData(input);
    return this.db.mediaFile.update({
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(input),
    });
  }

  /**
   * 创建新的媒体文件
   * @param input - 创建媒体文件所需的数据
   * @returns 创建的媒体文件记录
   */
  create(input: CreateMediaFileInput) {
    this.handleInputData(input);
    return this.db.mediaFile.create({
      data: this.parseCreateData(input),
    });
  }

  /**
   * 创建或更新媒体文件（如果存在则更新，不存在则创建）
   * @param where - 唯一查询条件
   * @param input - 创建/更新数据
   * @returns 创建或更新后的媒体文件记录
   */
  upsert(where: Pick<MediaFileWhereUniqueInput, PickWhereUniqueFields>, input: CreateMediaFileInput) {
    this.handleInputData(input);
    const data = this.parseCreateData(input);
    return this.db.mediaFile.upsert({
      where: this.parseUniqueWhere(where),
      update: data,
      create: data,
    });
  }

  /**
   * 删除媒体文件
   * @param where - 唯一查询条件（只能使用 id）
   * @returns 删除的媒体文件记录
   */
  delete(where: Pick<MediaFileWhereUniqueInput, PickWhereUniqueFields>) {
    return this.db.mediaFile.delete({
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除媒体文件
   * @param where - 查询条件（可选，不指定则删除所有记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteMany(where?: MediaFileWhereInput) {
    const args: Prisma.MediaFileDeleteManyArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.mediaFile.deleteMany(args);
  }

  /**
   * 根据文件夹 ID 删除该文件夹下的所有媒体文件
   * @param folderId - 文件夹唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByFolderId(folderId: string) {
    return this.deleteMany({ folderId: { equals: folderId } });
  }

  /**
   * 根据所有者 ID 和类型删除媒体文件
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
