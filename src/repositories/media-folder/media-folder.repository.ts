import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database';
import { FindManyMediaFolderArgs, UpsertOneMediaFolderArgs, Owner } from 'src/generated/graphql';
import { Prisma } from 'src/generated/prisma/client';

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
   * 规范化路径：去除空白、合并多余斜杠、确保以斜杠开头，去除末尾斜杠
   * @param path
   */
  normalizePath(path: string) {
    const trimmed = path.trim();
    if (!trimmed) return '';
    let normalized = trimmed;
    // 将反斜杠替换为正斜杠
    normalized = normalized.replace(/\\/g, '/');
    // 合并重复正斜杠
    normalized = normalized.replace(/\/+?/g, '/');
    // 确保前导斜杠
    if (!normalized.startsWith('/')) normalized = `/${normalized}`;
    // 去除末尾斜杠（但保留根路径"/")
    if (normalized.length > 1 && normalized.endsWith('/')) normalized = normalized.slice(0, -1);
    return normalized;
  }

  /**
   * 创建媒体文件夹
   * @param owner
   * @param ownerId
   * @param path
   */
  async createByPath(owner: Owner, ownerId: string, path: string) {
    if (!owner || !ownerId) {
      throw new Error('Invalid owner');
    }
    if (!path) {
      throw new Error('Invalid path');
    }

    const fullPath = this.normalizePath(path);
    if (!fullPath || fullPath === '/') {
      throw new Error('Invalid path');
    }

    // 如果最终文件夹已存在，直接返回
    const existing = await this.findOneByPath(owner, ownerId, fullPath);
    if (existing) return existing;

    const segments = fullPath.split('/').filter(Boolean);
    let parentFolder: Awaited<ReturnType<typeof this.findOneByPath>> | null = null;
    let currentFolder = null as Awaited<ReturnType<typeof this.save>> | null;

    for (let i = 0; i < segments.length; i++) {
      const name = segments[i];
      const depth = i + 1;
      const currPath = `/${segments.slice(0, i + 1).join('/')}`;

      // 尝试查找当前层级文件夹是否存在
      const found = await this.findOneByPath(owner, ownerId, currPath);
      if (found) {
        parentFolder = found;
        currentFolder = found as any;
        continue;
      }

      // 构建创建数据
      const data: UpsertOneMediaFolderArgs['create'] = {
        name,
        path: currPath,
        depth,
        owner,
        ...(parentFolder ? { parent: { connect: { id: parentFolder.id } } } : {}),
      };

      // 连接所有者实体
      let where: UpsertOneMediaFolderArgs['where'];
      switch (owner) {
        case Owner.Admin:
          data.admin = { connect: { id: ownerId } };
          // 移除其他所有者关系字段以避免冲突
          delete (data as any).member;
          delete (data as any).company;
          where = {
            adminFolderPathIdx: {
              adminId: ownerId,
              path: currPath,
            },
          };
          break;
        case Owner.Member:
          data.member = { connect: { id: ownerId } };
          delete (data as any).admin;
          delete (data as any).company;
          where = {
            memberFolderPathIdx: {
              memberId: ownerId,
              path: currPath,
            },
          };
          break;
        case Owner.Company:
          data.company = { connect: { id: ownerId } };
          // company 可以同时关联 admin 或 member，但此处创建文件夹仅绑定 company
          delete (data as any).admin;
          delete (data as any).member;
          where = {
            companyFolderPathIdx: {
              companyId: ownerId,
              path: currPath,
            },
          };
          break;
        default:
          throw new Error('Invalid owner type');
      }

      // 创建或更新（若并发情况下已创建）
      currentFolder = await this.save(where, data);
      parentFolder = currentFolder as any;
    }

    return currentFolder;
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
      case Owner.Member:
        return this.findUnique({
          memberFolderPathIdx: {
            memberId: ownerId,
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
