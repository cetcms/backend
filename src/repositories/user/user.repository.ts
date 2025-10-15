import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PasswordHandler } from 'src/common/handlers';
import { DatabaseService } from 'src/database';
import { FindManyUserArgs, FindUniqueUserArgs, UpsertOneUserArgs } from 'src/generated/graphql';

import { UserAbstract } from './user.abstract';

/**
 * 用户数据访问仓库类
 *
 * 继承自UserAbstract抽象类，实现了用户数据的具体访问方法
 * 包括密码处理、按ID查询、按邮箱查询、密码验证等功能
 */

@Injectable()
export class UserRepository extends UserAbstract {
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
  protected handleParsedData<T extends Prisma.UserCreateInput | Prisma.UserUpdateInput>(input: T): T {
    if (input.password && typeof input.password === 'string') {
      input.password = PasswordHandler(input.password).hash();
    } else {
      delete input.password;
    }
    return input;
  }

  /**
   * 保存用户记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param where - 唯一标识符
   * @param data - 更新或创建数据
   * @returns 更新或创建后的用户记录
   */
  save(where: UpsertOneUserArgs['where'], data: UpsertOneUserArgs['create']) {
    return this.upsert({
      where: where,
      update: data,
      create: data,
    });
  }

  /**
   * 根据ID查找用户
   *
   * @param id - 用户ID
   * @returns 查询到的用户信息
   */
  findOneById(id: string) {
    return this.findUnique({
      id,
    });
  }

  /**
   * 根据邮箱查找用户
   *
   * @param email - 用户邮箱
   * @returns 查询到的用户信息
   */
  findOneByEmail(email: string) {
    return this.findUnique({
      email,
    });
  }

  /**
   * 查找用户并验证密码
   *
   * @param where - 查询条件
   * @param password - 待验证的密码
   * @returns 验证成功返回用户信息，失败返回null
   */
  async findUniqueAndCheckPassword(where: FindUniqueUserArgs['where'], password: string) {
    const user = await this.findUnique(where);
    if (user && PasswordHandler(password).check(user.password)) return user;
    return null;
  }

  /**
   * 根据邮箱查找用户并验证密码
   *
   * @param email - 用户邮箱
   * @param password - 待验证的密码
   * @returns 验证成功返回用户信息，失败返回null
   */
  findByEmailAndCheckPassword(email: string, password: string) {
    return this.findUniqueAndCheckPassword({ email }, password);
  }

  /**
   * 根据ID查找用户并验证密码
   *
   * @param id - 用户ID
   * @param password - 待验证的密码
   * @returns 验证成功返回用户信息，失败返回null
   */
  findByIdAndCheckPassword(id: string, password: string) {
    return this.findUniqueAndCheckPassword({ id }, password);
  }

  /**
   * 查询多个用户并返回总数
   *
   * @param args - 查询参数
   * @returns 包含查询结果和总数的Promise数组
   */
  findManyAndCount(args: FindManyUserArgs) {
    return Promise.all([this.findMany(args), this.count(args.where)]);
  }
}
