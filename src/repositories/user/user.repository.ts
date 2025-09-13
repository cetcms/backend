import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PasswordHandler } from 'src/common/handlers';
import { DatabaseService } from 'src/database';
import {
  User,
  UserWhereInput,
  UserCreateInput,
  UserUpdateInput,
  UserWhereUniqueInput,
  UserOrderByWithRelationInput,
} from 'src/generated/graphql/user';
import {
  UserCreateInputObjectZodSchema,
  UserUpdateInputObjectSchema,
  UserWhereInputObjectSchema,
  UserWhereUniqueInputObjectSchema,
} from 'src/generated/schemas';

type PickWhereUniqueFields = 'id' | 'email';

/**
 * 用户数据访问层
 * 提供对用户的完整 CRUD 操作
 *
 * @description 该仓库类封装了所有与用户相关的数据库操作，
 * 包括查询、创建、更新、删除等功能，并提供了分页查询和批量操作的支持。
 * 自动处理密码的加密和存储，利用了 email 字段的唯一约束特性。
 */
@Injectable()
export class UserRepository {
  constructor(private readonly db: DatabaseService) {}

  /** 关联查询配置，用于指定查询时需要包含的关联数据 */
  private include: Prisma.UserInclude = {};

  /**
   * 设置关联查询配置
   * @param include - Prisma 关联查询配置对象
   */
  setInclude(include: Prisma.UserInclude) {
    this.include = include;
    return this;
  }

  /**
   * 处理输入数据，自动加密密码
   * @param input - 输入数据（包含密码时会自动加密）
   */
  private handleInputData(input: UserCreateInput | UserUpdateInput) {
    if (input.password) input.password = PasswordHandler(input.password).hash();
  }

  /**
   * 验证密码是否匹配
   * @param password - 原始密码
   * @param hashedPassword - 存储的哈希密码
   * @returns 如果密码匹配则返回 true，否则返回 false
   * @private
   */
  private checkPassword(password: string, hashedPassword: string) {
    return PasswordHandler(password).check(hashedPassword);
  }

  /**
   * 解析创建数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 创建用户的输入数据
   * @returns 解析后的创建数据
   */
  private parseCreateData(input: UserCreateInput) {
    return UserCreateInputObjectZodSchema.omit({
      companies: true,
      auths: true,
      logs: true,
      mediaFolders: true,
      mediaFiles: true,
    }).parse(input) as unknown as Prisma.UserCreateInput;
  }

  /**
   * 解析更新数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 更新用户的输入数据
   * @returns 解析后的更新数据
   */
  private parseUpdateData(input: UserUpdateInput) {
    return UserUpdateInputObjectSchema.parse(input) as unknown as Prisma.UserUpdateInput;
  }

  /**
   * 解析查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 查询条件
   * @returns 解析后的查询条件
   */
  private parseManyWhere(where: UserWhereInput) {
    return UserWhereInputObjectSchema.parse(where) as unknown as Prisma.UserWhereInput;
  }

  /**
   * 解析唯一查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 唯一查询条件
   * @returns 解析后的唯一查询条件
   */
  private parseUniqueWhere(where: UserWhereUniqueInput) {
    return UserWhereUniqueInputObjectSchema.parse(where) as unknown as Prisma.UserWhereUniqueInput;
  }

  /**
   * 根据邮箱查找用户
   * @param email - 用户邮箱（唯一字段）
   * @returns 匹配的用户记录或 null
   */
  findByEmail(email: string) {
    return this.findUnique({ email });
  }

  /**
   * 根据用户 ID 查找用户
   * @param id - 用户唯一标识符
   * @returns 匹配的用户记录或 null
   */
  findById(id: string) {
    return this.findUnique({ id });
  }

  /**
   * 根据唯一查询条件查找管理员并验证密码
   * @param where - 唯一查询条件（包含 id 或 email）
   * @param password - 原始密码
   * @returns 匹配的管理员记录或 null
   */
  async findUniqueAndCheckPassword(where: Pick<UserWhereUniqueInput, PickWhereUniqueFields>, password: string) {
    const user = await this.findUnique(where);
    if (user && this.checkPassword(password, user.password)) {
      return user;
    }
    return null;
  }

  /**
   * 根据管理员 ID 查找管理员并验证密码
   * @param id - 管理员唯一标识符
   * @param password - 原始密码
   * @returns 匹配的管理员记录或 null
   */
  findByIdAndCheckPassword(id: string, password: string) {
    return this.findUniqueAndCheckPassword({ id }, password);
  }

  /**
   * 根据邮箱查找管理员并验证密码
   * @param email - 管理员邮箱（唯一字段）
   * @param password - 原始密码
   * @returns 匹配的管理员记录或 null
   */
  findByEmailAndCheckPassword(email: string, password: string) {
    return this.findUniqueAndCheckPassword({ email }, password);
  }

  /**
   * 根据邮箱更新用户信息
   * @param email - 用户邮箱（唯一字段）
   * @param input - 更新数据（包含密码时会自动加密）
   * @returns 更新后的用户记录
   */
  updateByEmail(email: string, input: UserUpdateInput) {
    return this.update({ email }, input);
  }

  /**
   * 根据用户 ID 更新用户信息
   * @param id - 用户唯一标识符
   * @param input - 更新数据（包含密码时会自动加密）
   * @returns 更新后的用户记录
   */
  updateById(id: string, input: UserUpdateInput) {
    return this.update({ id }, input);
  }

  /**
   * 分页查询用户
   * @param skip - 跳过的记录数量（默认为 0）
   * @param take - 获取的记录数量（默认为 10）
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 包含总数和用户列表的数组 [总数, 用户列表]
   */
  findWithPagination(
    skip: number = 0,
    take: number = 10,
    where?: UserWhereInput,
    orderBy?: UserOrderByWithRelationInput
  ) {
    return Promise.all([this.count(where), this.findMany(where, orderBy, skip, take)]);
  }

  /**
   * 查找第一个匹配的用户
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 第一个匹配的用户记录或 null
   */
  findFirst(where?: UserWhereInput, orderBy?: UserOrderByWithRelationInput): Promise<User | null> {
    const args: Prisma.UserFindFirstArgs = { include: this.include, orderBy };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.user.findFirst(args);
  }

  /**
   * 根据唯一条件查找用户
   * @param where - 唯一查询条件（可使用 id 或 email）
   * @returns 匹配的用户记录或 null
   */
  findUnique(where: Pick<UserWhereUniqueInput, PickWhereUniqueFields>): Promise<User | null> {
    return this.db.user.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.include,
    });
  }

  /**
   * 查询多个用户
   * @param where - 查询条件（可选）
   * @param orderBy - 排序条件（可选）
   * @param skip - 跳过的记录数量（可选）
   * @param take - 获取的记录数量（可选）
   * @returns 符合条件的用户列表
   */
  findMany(
    where?: UserWhereInput,
    orderBy?: UserOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<User[]> {
    const args: Prisma.UserFindManyArgs = {
      include: this.include,
      orderBy,
      skip,
      take,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.user.findMany(args);
  }

  /**
   * 统计符合条件的用户数量
   * @param where - 查询条件（可选）
   * @returns 符合条件的记录总数
   */
  count(where?: UserWhereInput): Promise<number> {
    const args: Prisma.UserCountArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.user.count(args);
  }

  /**
   * 更新用户信息
   * @param where - 唯一查询条件（可使用 id 或 email）
   * @param input - 更新数据（包含密码时会自动进行哈希加密）
   * @returns 更新后的用户记录
   */
  update(where: Pick<UserWhereUniqueInput, PickWhereUniqueFields>, input: UserUpdateInput): Promise<User> {
    this.handleInputData(input);
    return this.db.user.update({
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(input),
    });
  }

  /**
   * 创建新的用户
   * @param input - 创建用户所需的数据（包含密码时会自动进行哈希加密）
   * @returns 创建的用户记录
   */
  create(input: UserCreateInput): Promise<User> {
    this.handleInputData(input);
    return this.db.user.create({
      data: this.parseCreateData(input),
    });
  }

  /**
   * 创建或更新用户（如果存在则更新，不存在则创建）
   * @param where - 唯一查询条件
   * @param input - 创建/更新数据（包含密码时会自动进行哈希加密）
   * @returns 创建或更新后的用户记录
   */
  upsert(where: Pick<UserWhereUniqueInput, PickWhereUniqueFields>, input: UserCreateInput): Promise<User> {
    this.handleInputData(input);
    const data = this.parseCreateData(input);
    return this.db.user.upsert({
      where: this.parseUniqueWhere(where),
      update: data,
      create: data,
    });
  }

  /**
   * 删除用户
   * @param where - 唯一查询条件（可使用 id 或 email）
   * @returns 删除的用户记录
   */
  delete(where: Pick<UserWhereUniqueInput, PickWhereUniqueFields>): Promise<User> {
    return this.db.user.delete({
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除用户
   * @param where - 查询条件（可选，不指定则删除所有记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteMany(where?: UserWhereInput) {
    const args: Prisma.UserDeleteManyArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.user.deleteMany(args);
  }
}
