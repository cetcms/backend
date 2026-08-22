import { Injectable } from '@nestjs/common';

import { PasswordHandler } from 'src/common/handlers';
import { DatabaseService } from 'src/database';
import { FindManyMemberArgs, FindUniqueMemberArgs, UpsertOneMemberArgs } from 'src/generated/graphql';
import { Prisma } from 'src/generated/prisma/client';

import { MemberAbstract } from './member.abstract';

/**
 * 成员数据访问仓库类
 *
 * 继承自MemberAbstract抽象类，实现了成员数据的具体访问方法
 * 包括密码处理、按ID查询、按邮箱查询、密码验证等功能
 */

@Injectable()
export class MemberRepository extends MemberAbstract {
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
  protected handleParsedData<T extends Prisma.MemberCreateInput | Prisma.MemberUpdateInput>(input: T): T {
    if (input.password && typeof input.password === 'string') {
      input.password = PasswordHandler(input.password).hash();
    } else {
      delete input.password;
    }
    return input;
  }

  /**
   * 保存成员记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的成员记录
   */
  save(where: UpsertOneMemberArgs['where'], data: UpsertOneMemberArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据ID查找成员
   *
   * @param id - 成员ID
   * @returns 查询到的成员信息
   */
  findOneById(id: string) {
    return this.findUnique({
      id,
    });
  }

  /**
   * 根据邮箱查找成员
   *
   * @param email - 成员邮箱
   * @returns 查询到的成员信息
   */
  findOneByEmail(email: string) {
    return this.findUnique({
      email,
    });
  }

  /**
   * 查找成员并验证密码
   *
   * @param where - 查询条件
   * @param password - 待验证的密码
   * @returns 验证成功返回成员信息，失败返回null
   */
  async findUniqueAndCheckPassword(where: FindUniqueMemberArgs['where'], password: string) {
    const member = await this.findUnique(where);
    if (member && PasswordHandler(password).check(member.password)) return member;
    return null;
  }

  /**
   * 根据邮箱查找成员并验证密码
   *
   * @param email - 成员邮箱
   * @param password - 待验证的密码
   * @returns 验证成功返回成员信息，失败返回null
   */
  findByEmailAndCheckPassword(email: string, password: string) {
    return this.findUniqueAndCheckPassword({ email }, password);
  }

  /**
   * 根据ID查找成员并验证密码
   *
   * @param id - 成员ID
   * @param password - 待验证的密码
   * @returns 验证成功返回成员信息，失败返回null
   */
  findByIdAndCheckPassword(id: string, password: string) {
    return this.findUniqueAndCheckPassword({ id }, password);
  }

  /**
   * 查询多个成员并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyMemberArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }
}
