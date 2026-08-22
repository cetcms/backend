import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database';
import { FindManyWebsiteArgs, UpsertOneWebsiteArgs } from 'src/generated/graphql';
import { Prisma } from 'src/generated/prisma/client';

import { WebsiteAbstract } from './website.abstract';

/**
 * 网站数据访问仓库类
 *
 * 继承自WebsiteAbstract抽象类，实现了网站数据的具体访问方法
 * 包括密码处理、按ID查询、按邮箱查询、密码验证等功能
 */

@Injectable()
export class WebsiteRepository extends WebsiteAbstract {
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
   * @returns 处理后的数据，如果包含密码则进行哈希处理
   */
  protected handleParsedData<T extends Prisma.WebsiteCreateInput | Prisma.WebsiteUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存网站记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的网站记录
   */
  save(where: UpsertOneWebsiteArgs['where'], data: UpsertOneWebsiteArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据ID查找网站
   *
   * @param id - 网站ID
   * @returns 查询到的网站信息
   */
  findOneById(id: string) {
    return this.findUnique({
      id,
    });
  }

  /**
   * 查询多个网站并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyWebsiteArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }
}
