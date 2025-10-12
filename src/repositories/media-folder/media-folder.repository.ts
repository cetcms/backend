import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { FindManyMediaFolderArgs, UpsertOneMediaFolderArgs, Owner } from 'src/generated/graphql';

import { MediaFolderAbstract } from './media-folder.abstract';

/**
 * 媒体文件夹数据访问仓库类
 *
 * 继承自MediaFolderAbstract抽象类，实现了媒体文件夹数据的具体访问方法
 */

@Injectable()
export class MediaFolderRepository extends MediaFolderAbstract {
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
  protected handleParsedData<T extends Prisma.MediaFolderCreateInput | Prisma.MediaFolderUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存媒体文件夹记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的媒体文件夹记录
   */
  save(where: UpsertOneMediaFolderArgs['where'], data: UpsertOneMediaFolderArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据ID查找媒体文件夹
   *
   * @param id - 媒体文件夹ID
   * @returns 查询到的媒体文件夹信息
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
   * 根据路径查找媒体文件夹
   * @param owner
   * @param ownerId
   * @param path
   */
  findOneByPath(owner: Owner, ownerId: string, path: string) {
    switch (owner) {
      case Owner.Admin:
        return this.findUnique({
          adminFolderPathIdx: {
            adminId: ownerId,
            path: path,
          },
        });
      case Owner.Company:
        return this.findUnique({
          companyFolderPathIdx: {
            companyId: ownerId,
            path: path,
          },
        });
      case Owner.User:
        return this.findUnique({
          userFolderPathIdx: {
            userId: ownerId,
            path: path,
          },
        });
      default:
        throw new Error('Invalid owner type');
    }
  }

  /**
   * 根据父文件夹ID查找媒体文件夹
   *
   * @param parentId - 父文件夹ID
   * @returns 查询到的媒体文件夹列表
   */
  findByParentId(parentId: string) {
    return this.findMany({
      where: {
        parentId: {
          equals: parentId,
        },
      },
    });
  }

  /**
   * 查询多个媒体文件夹并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyMediaFolderArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }
}
