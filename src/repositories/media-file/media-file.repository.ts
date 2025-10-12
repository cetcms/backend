import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { FindManyMediaFileArgs, Owner, UpsertOneMediaFileArgs } from 'src/generated/graphql';

import { MediaFileAbstract } from './media-file.abstract';

/**
 * 媒体文件数据访问仓库类
 *
 * 继承自MediaFileAbstract抽象类，实现了媒体文件数据的具体访问方法
 */

@Injectable()
export class MediaFileRepository extends MediaFileAbstract {
  /**
   * 构造函数
   *
   * @param db - 数据库服务实例，用于执行数据库操作
   */
  constructor(protected readonly db: DatabaseService) {
    super(db);
  }

  /**
   * 处理解析后的数据
   *
   * 实现抽象方法，主要用于处理解析后的数据
   *
   * @param input - 输入的创建或更新数据
   * @returns 处理后的数据
   */
  protected handleParsedData<T extends Prisma.MediaFileCreateInput | Prisma.MediaFileUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存媒体文件记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的媒体文件记录
   */
  save(where: UpsertOneMediaFileArgs['where'], data: UpsertOneMediaFileArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 在指定文件信息到媒体文件夹
   * @param owner
   * @param ownerId
   * @param folderId
   * @param input
   */
  saveToFolder(
    owner: Owner,
    ownerId: string,
    folderId: string,
    input: Omit<UpsertOneMediaFileArgs['create'], 'folder' | 'owner' | 'company'>
  ) {
    const data: UpsertOneMediaFileArgs['create'] = {
      ...input,
      folder: { connect: { id: folderId } },
      owner,
    };
    switch (owner) {
      case Owner.Admin:
        data.admin = { connect: { id: ownerId } };
        delete data.user;
        delete data.company;
        return this.save(
          {
            adminFileIdx: {
              folderId,
              adminId: ownerId,
              fileName: data.fileName,
            },
          },
          data
        );
      case Owner.User:
        data.user = { connect: { id: ownerId } };
        delete data.admin;
        delete data.company;
        return this.save(
          {
            userFileIdx: {
              folderId,
              userId: ownerId,
              fileName: data.fileName,
            },
          },
          data
        );
      case Owner.Company:
        data.company = { connect: { id: ownerId } };
        if (data.user) delete data.admin;
        if (data.admin) delete data.user;
        return this.save(
          {
            companyFileIdx: {
              folderId,
              companyId: ownerId,
              fileName: data.fileName,
            },
          },
          data
        );
      default:
        throw new Error('Invalid owner');
    }
  }

  /**
   * 根据ID查找媒体文件
   *
   * @param id - 媒体文件ID
   * @returns 查询到的媒体文件信息
   */
  findOneById(id: string) {
    return this.findFirst({
      where: {
        id: {
          equals: id,
        },
      },
    });
  }

  /**
   * 根据文件夹ID查找媒体文件
   *
   * @param folderId - 文件夹ID
   * @returns 查询到的媒体文件列表
   */
  findByFolderId(folderId: string) {
    return this.findMany({
      where: {
        folderId: {
          equals: folderId,
        },
      },
    });
  }

  /**
   * 查询多个媒体文件并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyMediaFileArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }
}
