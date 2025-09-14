import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { FindManyRequestLogArgs, UpsertOneRequestLogArgs } from 'src/generated/graphql';

import { RequestLogAbstract } from './request-log.abstract';

/**
 * 请求日志数据访问仓库类
 *
 * 继承自RequestLogAbstract抽象类，实现了请求日志数据的具体访问方法
 */

@Injectable()
export class RequestLogRepository extends RequestLogAbstract {
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
  protected handleParsedData<T extends Prisma.RequestLogCreateInput | Prisma.RequestLogUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存请求日志记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的请求日志记录
   */
  save(where: UpsertOneRequestLogArgs['where'], data: UpsertOneRequestLogArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据ID查找请求日志
   *
   * @param id - 请求日志ID
   * @returns 查询到的请求日志信息
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
   * 根据用户ID查找请求日志
   *
   * @param userId - 用户ID
   * @returns 查询到的请求日志列表
   */
  findByUserId(userId: string) {
    return this.findMany({
      where: {
        userId: {
          equals: userId,
        },
      },
    });
  }

  /**
   * 根据IP地址查找请求日志
   *
   * @param ip - IP地址
   * @returns 查询到的请求日志列表
   */
  findByIp(ip: string) {
    return this.findMany({
      where: {
        ip: {
          equals: ip,
        },
      },
    });
  }

  /**
   * 查询多个请求日志并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyRequestLogArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }
}
