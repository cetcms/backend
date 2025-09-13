import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  AdminRole,
  AdminRoleWhereInput,
  AdminRoleUpdateInput,
  AdminRoleCreateInput,
  AdminRoleWhereUniqueInput,
  AdminRoleOrderByWithRelationInput,
} from 'src/generated/graphql/admin-role';
import {
  AdminRoleCreateInputObjectZodSchema,
  AdminRoleUpdateInputObjectSchema,
  AdminRoleWhereInputObjectSchema,
  AdminRoleWhereUniqueInputObjectSchema,
} from 'src/generated/schemas';
import voca from 'voca';

type PickWhereUniqueFields = 'id' | 'code' | 'name';

/**
 * 管理员角色数据访问层
 * 提供对管理员角色的完整 CRUD 操作
 *
 * @description 该仓库类封装了所有与管理员角色相关的数据库操作，
 * 包括查询、创建、更新、删除等功能，并提供了分页查询和批量操作的支持。
 * 利用了 code 和 name 字段的唯一约束特性进行优化查询。
 */
@Injectable()
export class AdminRoleRepository {
  constructor(private readonly db: DatabaseService) {}

  /** 关联查询配置，用于指定查询时需要包含的关联数据 */
  private include: Prisma.AdminRoleInclude = {};

  /**
   * 设置关联查询配置
   * @param include - Prisma 关联查询配置对象
   */
  setInclude(include: Prisma.AdminRoleInclude) {
    this.include = include;
    return this;
  }

  /**
   * 处理输入数据，将名称和代码转换为规范格式
   * @param input - 创建或更新管理员角色的输入数据
   * @returns 处理后的输入数据
   */
  private handleInputData(input: AdminRoleCreateInput | AdminRoleUpdateInput) {
    if (input.name) input.name = voca.titleCase(input.name);
    if (input.code) input.code = voca.snakeCase(input.code).toUpperCase();
    return input;
  }

  /**
   * 解析创建数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 创建管理员角色的输入数据
   * @returns 解析后的创建数据
   */
  private parseCreateData(input: AdminRoleCreateInput) {
    return AdminRoleCreateInputObjectZodSchema.omit({
      admins: true,
    }).parse(input) as unknown as Prisma.AdminRoleCreateInput;
  }

  /**
   * 解析更新数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 更新管理员角色的输入数据
   * @returns 解析后的更新数据
   */
  private parseUpdateData(input: AdminRoleUpdateInput) {
    return AdminRoleUpdateInputObjectSchema.parse(input) as unknown as Prisma.AdminRoleUpdateInput;
  }

  /**
   * 解析查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 查询条件
   * @returns 解析后的查询条件
   */
  private parseManyWhere(where: AdminRoleWhereInput) {
    return AdminRoleWhereInputObjectSchema.parse(where) as unknown as Prisma.AdminRoleWhereInput;
  }

  /**
   * 解析唯一查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 唯一查询条件
   * @returns 解析后的唯一查询条件
   */
  private parseUniqueWhere(where: AdminRoleWhereUniqueInput) {
    return AdminRoleWhereUniqueInputObjectSchema.parse(where) as unknown as Prisma.AdminRoleWhereUniqueInput;
  }

  /**
   * 根据角色代码查找管理员角色
   * @param code - 角色代码（唯一字段）
   * @returns 匹配的管理员角色记录或 null
   */
  findByCode(code: string) {
    return this.findUnique({ code });
  }

  /**
   * 根据角色名称查找管理员角色
   * @param name - 角色名称（唯一字段）
   * @returns 匹配的管理员角色记录或 null
   */
  findByName(name: string) {
    return this.findUnique({ name });
  }

  /**
   * 根据角色 ID 查找管理员角色
   * @param id - 角色唯一标识符
   * @returns 匹配的管理员角色记录或 null
   */
  findById(id: string) {
    return this.findUnique({ id });
  }

  /**
   * 根据角色代码更新管理员角色
   * @param code - 角色代码（唯一字段）
   * @param input - 更新数据
   * @returns 更新后的管理员角色记录
   */
  updateByCode(code: string, input: AdminRoleUpdateInput) {
    return this.update({ code }, input);
  }

  /**
   * 根据角色名称更新管理员角色
   * @param name - 角色名称（唯一字段）
   * @param input - 更新数据
   * @returns 更新后的管理员角色记录
   */
  updateByName(name: string, input: AdminRoleUpdateInput) {
    return this.update({ name }, input);
  }

  /**
   * 根据角色 ID 更新管理员角色
   * @param id - 角色唯一标识符
   * @param input - 更新数据
   * @returns 更新后的管理员角色记录
   */
  updateById(id: string, input: AdminRoleUpdateInput) {
    return this.update({ id }, input);
  }

  /**
   * 分页查询管理员角色
   * @param skip - 跳过的记录数量（默认为 0）
   * @param take - 获取的记录数量（默认为 10）
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 包含总数和角色列表的数组 [总数, 角色列表]
   */
  findWithPagination(
    skip: number = 0,
    take: number = 10,
    where?: AdminRoleWhereInput,
    orderBy?: AdminRoleOrderByWithRelationInput
  ) {
    return Promise.all([this.count(where), this.findMany(where, orderBy, skip, take)]);
  }

  /**
   * 查找第一个匹配的管理员角色
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 第一个匹配的管理员角色记录或 null
   */
  findFirst(where?: AdminRoleWhereInput, orderBy?: AdminRoleOrderByWithRelationInput): Promise<AdminRole | null> {
    const args: Prisma.AdminRoleFindFirstArgs = {
      include: this.include,
      orderBy,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.adminRole.findFirst(args);
  }

  /**
   * 根据唯一条件查找管理员角色
   * @param where - 唯一查询条件（可使用 id、code 或 name）
   * @returns 匹配的管理员角色记录或 null
   */
  findUnique(where: Pick<AdminRoleWhereUniqueInput, PickWhereUniqueFields>): Promise<AdminRole | null> {
    return this.db.adminRole.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.include,
    });
  }

  /**
   * 查询多个管理员角色
   * @param where - 查询条件（可选）
   * @param orderBy - 排序条件（可选）
   * @param skip - 跳过的记录数量（可选）
   * @param take - 获取的记录数量（可选）
   * @returns 符合条件的管理员角色列表
   */
  findMany(
    where?: AdminRoleWhereInput,
    orderBy?: AdminRoleOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<AdminRole[]> {
    const args: Prisma.AdminRoleFindManyArgs = {
      include: this.include,
      orderBy,
      skip,
      take,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.adminRole.findMany(args);
  }

  /**
   * 统计符合条件的管理员角色数量
   * @param where - 查询条件（可选）
   * @returns 符合条件的记录总数
   */
  count(where?: AdminRoleWhereInput): Promise<number> {
    const args: Prisma.AdminRoleCountArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.adminRole.count(args);
  }

  /**
   * 更新管理员角色
   * @param where - 唯一查询条件（可使用 id、code 或 name）
   * @param input - 更新数据
   * @returns 更新后的管理员角色记录
   */
  update(
    where: Pick<AdminRoleWhereUniqueInput, PickWhereUniqueFields>,
    input: AdminRoleUpdateInput
  ): Promise<AdminRole> {
    this.handleInputData(input);
    return this.db.adminRole.update({
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(input),
    });
  }

  /**
   * 创建新的管理员角色
   * @param input - 创建角色所需的数据
   * @returns 创建的管理员角色记录
   */
  create(input: AdminRoleCreateInput): Promise<AdminRole> {
    this.handleInputData(input);
    return this.db.adminRole.create({
      data: this.parseCreateData(input),
    });
  }

  /**
   * 创建或更新管理员角色（如果存在则更新，不存在则创建）
   * @param where - 唯一查询条件
   * @param input - 创建/更新数据
   * @returns 创建或更新后的管理员角色记录
   */
  upsert(
    where: Pick<AdminRoleWhereUniqueInput, PickWhereUniqueFields>,
    input: AdminRoleCreateInput
  ): Promise<AdminRole> {
    this.handleInputData(input);
    const data = this.parseCreateData(input);
    return this.db.adminRole.upsert({
      where: this.parseUniqueWhere(where),
      update: data,
      create: data,
    });
  }

  /**
   * 删除管理员角色
   * @param where - 唯一查询条件（可使用 id、code 或 name）
   * @returns 删除的管理员角色记录
   */
  delete(where: Pick<AdminRoleWhereUniqueInput, PickWhereUniqueFields>): Promise<AdminRole> {
    return this.db.adminRole.delete({
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除管理员角色
   * @param where - 查询条件（可选，不指定则删除所有记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteMany(where?: AdminRoleWhereInput) {
    const args: Prisma.AdminRoleDeleteManyArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.adminRole.deleteMany(args);
  }
}
