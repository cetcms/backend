import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/database';
import { FindManyNotificationArgs, UpsertOneNotificationArgs } from 'src/generated/graphql';
import { Prisma } from 'src/generated/prisma/client';

import { NotificationAbstract } from './notification.abstract';

/**
 * 消息通知数据访问仓库类
 *
 * 继承自NotificationAbstract抽象类，实现了消息通知数据的具体访问方法
 */

@Injectable()
export class NotificationRepository extends NotificationAbstract {
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
  protected handleParsedData<T extends Prisma.NotificationCreateInput | Prisma.NotificationUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存消息通知记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的消息通知记录
   */
  save(where: UpsertOneNotificationArgs['where'], data: UpsertOneNotificationArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据ID查找消息通知
   *
   * @param id - 消息通知ID
   * @returns 查询到的消息通知信息
   */
  findOneById(id: string) {
    return this.findUnique({
      id,
    });
  }

  /**
   * 查询多个消息通知并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyNotificationArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }
}
