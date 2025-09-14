import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { FindManyCompanyArgs, UpsertOneCompanyArgs } from 'src/generated/graphql';

import { CompanyAbstract } from './company.abstract';

/**
 * 企业数据访问仓库类
 *
 * 继承自CompanyAbstract抽象类，实现了企业数据的具体访问方法
 */

@Injectable()
export class CompanyRepository extends CompanyAbstract {
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
  protected handleParsedData<T extends Prisma.CompanyCreateInput | Prisma.CompanyUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存企业记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的企业记录
   */
  save(where: UpsertOneCompanyArgs['where'], data: UpsertOneCompanyArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据ID查找企业
   *
   * @param id - 企业ID
   * @returns 查询到的企业信息
   */
  findOneById(id: string) {
    return this.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * 根据企业名称查找企业
   *
   * @param name - 企业名称
   * @returns 查询到的企业信息
   */
  findOneByName(name: string) {
    return this.findUnique({
      where: {
        name,
      },
    });
  }

  /**
   * 根据企业代码查找企业
   *
   * @param code - 企业代码
   * @returns 查询到的企业信息
   */
  findOneByCode(code: string) {
    return this.findUnique({
      where: {
        code,
      },
    });
  }

  /**
   * 查询多个企业并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyCompanyArgs) {
    return Promise.all([this.findMany(args), this.count(args)]);
  }
}
