import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import { CompanyRoleCreateInput, FindManyCompanyRoleArgs, UpsertOneCompanyRoleArgs } from 'src/generated/graphql';

import { CompanyRoleAbstract } from './company-role.abstract';

/**
 * 企业角色数据访问仓库类
 *
 * 继承自CompanyRoleAbstract抽象类，实现了企业角色数据的具体访问方法
 */

@Injectable()
export class CompanyRoleRepository extends CompanyRoleAbstract {
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
  protected handleParsedData<T extends Prisma.CompanyRoleCreateInput | Prisma.CompanyRoleUpdateInput>(input: T): T {
    return input;
  }

  /**
   * 保存企业角色记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的企业角色记录
   */
  save(where: UpsertOneCompanyRoleArgs['where'], data: UpsertOneCompanyRoleArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  async saveCommonRole(code: string, data: Omit<CompanyRoleCreateInput, 'code' | 'company'>) {
    const role = await this.findCommonRole(code);
    if (role) {
      return this.update({ id: role.id }, data);
    } else {
      return this.create({ code, ...data });
    }
  }

  findCommonRole(code: string) {
    return this.findFirst({
      where: { code: { equals: code } },
      orderBy: [{ companyId: { sort: 'asc', nulls: 'first' } }],
    });
  }

  /**
   * 根据ID查找企业角色
   *
   * @param id - 企业角色ID
   * @returns 查询到的企业角色信息
   */
  findOneById(id: string) {
    return this.findUnique({ id });
  }

  /**
   * 根据角色代码查找企业角色
   *
   * @param code - 角色代码
   * @returns 查询到的企业角色信息
   */
  findOneByUnique(code: string, companyId: string) {
    return this.findUnique({ companyRoleIdx: { companyId, code } });
  }

  /**
   * 根据角色名称查找企业角色
   *
   * @param name - 角色名称
   * @returns 查询到的企业角色信息
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
   * 根据企业ID查找企业角色
   *
   * @param companyId - 企业ID
   * @returns 查询到的企业角色列表
   */
  findByCompanyId(companyId: string) {
    return this.findMany({
      where: {
        companyId: {
          equals: companyId,
        },
      },
    });
  }

  /**
   * 查询多个企业角色并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyCompanyRoleArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }
}
