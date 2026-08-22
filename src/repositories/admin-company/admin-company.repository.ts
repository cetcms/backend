import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database';
import { FindManyAdminCompanyArgs, UpsertOneAdminCompanyArgs } from 'src/generated/graphql';
import { Prisma } from 'src/generated/prisma/client';

import { AdminCompanyAbstract } from './admin-company.abstract';

/**
 * 管理员企业关联数据访问仓库类
 *
 * 继承自AdminCompanyAbstract抽象类，实现了管理员企业关联数据的具体访问方法
 */

@Injectable()
export class AdminCompanyRepository extends AdminCompanyAbstract {
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
  protected handleParsedData<T extends Prisma.AdminCompanyCreateInput | Prisma.AdminCompanyUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存管理员企业关联记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的管理员企业关联记录
   */
  save(where: UpsertOneAdminCompanyArgs['where'], data: UpsertOneAdminCompanyArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据管理员ID查找管理员企业关联
   *
   * @param adminId - 管理员ID
   * @param args
   * @returns 查询到的管理员企业关联信息
   */
  findManyByAdminId(adminId: string, args?: Omit<FindManyAdminCompanyArgs, 'where'>) {
    return this.findMany({
      where: { adminId: { equals: adminId } },
      ...args,
    });
  }

  /**
   * 根据企业ID查找管理员企业关联
   *
   * @param companyId - 企业ID
   * @param args
   * @returns 查询到的管理员企业关联信息
   */
  findManyByCompanyId(companyId: string, args?: Omit<FindManyAdminCompanyArgs, 'where'>) {
    return this.findMany({
      where: { companyId: { equals: companyId } },
      ...args,
    });
  }

  /**
   * 根据管理员ID和企业ID查找管理员企业关联
   *
   * @param adminId - 管理员ID
   * @param companyId - 企业ID
   * @returns 查询到的管理员企业关联信息
   */
  findOneByUnique(adminId: string, companyId: string) {
    return this.findUnique({ adminCompanyIdx: { adminId, companyId } });
  }

  /**
   * 查询多个管理员企业关联并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyAdminCompanyArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }

  /**
   * 根据管理员 ID 和企业 ID 删除关联关系
   * @param adminId - 管理员唯一标识符
   * @param companyId - 企业唯一标识符
   * @returns 删除的管理员企业关联记录
   */
  deleteByUnique(adminId: string, companyId: string) {
    return this.delete({ adminCompanyIdx: { adminId, companyId } });
  }

  /**
   * 根据管理员 ID 删除该管理员的所有企业关联关系
   * @param adminId - 管理员唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByAdminId(adminId: string) {
    return this.deleteMany({ adminId: { equals: adminId } });
  }

  /**
   * 根据公司 ID 删除该公司的所有管理员关联关系
   * @param companyId - 公司唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByCompanyId(companyId: string) {
    return this.deleteMany({ companyId: { equals: companyId } });
  }
}
