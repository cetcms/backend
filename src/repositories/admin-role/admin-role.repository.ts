import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { FindManyAdminRoleArgs, UpsertOneAdminRoleArgs } from 'src/generated/graphql';

import { AdminRoleAbstract } from './admin-role.abstract';

/**
 * 管理员角色数据访问仓库类
 *
 * 继承自AdminRoleAbstract抽象类，实现了管理员角色数据的具体访问方法
 */

@Injectable()
export class AdminRoleRepository extends AdminRoleAbstract {
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
  protected handleParsedData<T extends Prisma.AdminRoleCreateInput | Prisma.AdminRoleUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存管理员角色记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的管理员角色记录
   */
  save(where: UpsertOneAdminRoleArgs['where'], data: UpsertOneAdminRoleArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据ID查找管理员角色
   *
   * @param id - 管理员角色ID
   * @returns 查询到的管理员角色信息
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
   * 根据角色名称查找管理员角色
   *
   * @param name - 角色名称
   * @returns 查询到的管理员角色信息
   */
  findOneByName(name: string) {
    return this.findFirst({
      where: {
        name: {
          equals: name,
        },
      },
    });
  }

  /**
   * 查询多个管理员角色并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyAdminRoleArgs) {
    return Promise.all([this.findMany(args), this.count(args)]);
  }
}
