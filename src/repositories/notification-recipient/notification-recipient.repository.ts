import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { FindManyNotificationRecipientArgs, UpsertOneNotificationRecipientArgs } from 'src/generated/graphql';

import { NotificationRecipientAbstract } from './notification-recipient.abstract';

/**
 * 消息通知接收数据访问仓库类
 *
 * 继承自NotificationRecipientAbstract抽象类，实现了消息通知接收数据的具体访问方法
 */

@Injectable()
export class NotificationRecipientRepository extends NotificationRecipientAbstract {
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
  protected handleParsedData<
    T extends Prisma.NotificationRecipientCreateInput | Prisma.NotificationRecipientUpdateInput,
  >(input: T): T {
    return input;
  }

  /**
   * 保存消息通知接收记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的消息通知接收记录
   */
  save(where: UpsertOneNotificationRecipientArgs['where'], data: UpsertOneNotificationRecipientArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据ID查找消息通知接收
   *
   * @param id - 消息通知接收ID
   * @returns 查询到的消息通知接收信息
   */
  findOneById(id: string) {
    return this.findUnique({
      id,
    });
  }

  /**
   * 查询多个消息通知接收并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyNotificationRecipientArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }
}
