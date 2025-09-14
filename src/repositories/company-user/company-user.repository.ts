import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { FindManyCompanyUserArgs, UpsertOneCompanyUserArgs } from 'src/generated/graphql';

import { CompanyUserAbstract } from './company-user.abstract';

/**
 * 企业用户关联数据访问仓库类
 *
 * 继承自CompanyUserAbstract抽象类，实现了企业用户关联数据的具体访问方法
 */

@Injectable()
export class CompanyUserRepository extends CompanyUserAbstract {
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
  protected handleParsedData<T extends Prisma.CompanyUserCreateInput | Prisma.CompanyUserUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存企业用户关联记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的企业用户关联记录
   */
  save(where: UpsertOneCompanyUserArgs['where'], data: UpsertOneCompanyUserArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据用户ID和企业ID查找企业用户关联
   *
   * @param userId - 用户ID
   * @param companyId - 企业ID
   * @returns 查询到的企业用户关联信息
   */
  findOneByUnique(userId: string, companyId: string) {
    return this.findUnique({
      where: {
        companyUserIdx: {
          companyId,
          userId,
        },
      },
    });
  }

  /**
   * 根据用户ID查找企业用户关联
   *
   * @param userId - 用户ID
   * @returns 查询到的企业用户关联信息
   */
  findManyByUserId(userId: string) {
    return this.findMany({
      where: {
        userId: {
          equals: userId,
        },
      },
    });
  }

  /**
   * 根据企业ID查找企业用户关联
   *
   * @param companyId - 企业ID
   * @returns 查询到的企业用户关联信息
   */
  findManyByCompanyId(companyId: string) {
    return this.findMany({
      where: {
        companyId: {
          equals: companyId,
        },
      },
    });
  }

  /**
   * 查询多个企业用户关联并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyCompanyUserArgs) {
    return Promise.all([this.findMany(args), this.count(args)]);
  }
}
