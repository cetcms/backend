import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database';
import {
  CompanyRole,
  CompanyRoleCreateInput,
  CompanyRoleOrderByWithRelationInput,
  CompanyRoleUpdateInput,
  CompanyRoleWhereInput,
  CompanyRoleWhereUniqueInput,
  CreateOneCompanyRoleArgs,
  DeleteManyCompanyRoleArgs,
  DeleteOneCompanyRoleArgs,
  FindFirstCompanyRoleArgs,
  FindManyCompanyRoleArgs,
  FindUniqueCompanyRoleArgs,
  UpdateOneCompanyRoleArgs,
  UpsertOneCompanyRoleArgs,
} from 'src/generated/graphql';
import { Prisma } from 'src/generated/prisma/client';
import {
  CompanyRoleCreateInputObjectZodSchema,
  CompanyRoleIncludeObjectZodSchema,
  CompanyRoleOrderByWithRelationInputObjectZodSchema,
  CompanyRoleSelectObjectZodSchema,
  CompanyRoleUpdateInputObjectZodSchema,
  CompanyRoleWhereInputObjectZodSchema,
  CompanyRoleWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 企业角色数据访问抽象类
 *
 * 该抽象类提供了对企业角色数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class CompanyRoleAbstract {
  /**
   * 构造函数
   *
   * @param db - 数据库服务实例，用于执行数据库操作
   */
  protected constructor(protected readonly db: DatabaseService) {}

  /**
   * 处理解析后的数据
   *
   * 此抽象方法需要在子类中实现，用于在创建或更新操作前处理数据
   *
   * @param input - 输入的创建或更新数据
   * @returns 处理后的数据
   */
  protected abstract handleParsedData<T extends Prisma.CompanyRoleCreateInput | Prisma.CompanyRoleUpdateInput>(
    input: T
  ): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.CompanyRoleInclude = {};

  /**
   * 选择字段配置
   *
   * 用于指定查询时需要选择的字段
   */
  protected select: Prisma.CompanyRoleSelect = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.CompanyRoleInclude) {
    this.include = CompanyRoleIncludeObjectZodSchema.parse(include) as Prisma.CompanyRoleInclude;
    return this;
  }

  /**
   * 获取包含关系配置
   *
   * @returns 当前设置的包含关系配置
   */
  getInclude() {
    return this.include;
  }

  /**
   * 设置选择字段
   *
   * 设置查询时需要选择的字段
   *
   * @param select - 选择字段配置对象
   * @returns 当前实例，支持链式调用
   */
  setSelect(select?: Prisma.CompanyRoleSelect) {
    this.select = CompanyRoleSelectObjectZodSchema.parse(select) as Prisma.CompanyRoleSelect;
    return this;
  }

  /**
   * 获取选择字段配置
   *
   * @returns 当前设置的选择字段配置
   */
  getSelect() {
    return this.select;
  }

  /**
   * 解析查询条件
   *
   * 使用Zod验证并转换查询条件
   *
   * @param where - 查询条件
   * @returns 解析后的Prisma查询条件
   * @private
   */
  private parseWhere(where: CompanyRoleWhereInput) {
    return CompanyRoleWhereInputObjectZodSchema.parse(where) as unknown as Prisma.CompanyRoleWhereInput;
  }

  /**
   * 解析唯一查询条件
   *
   * 使用Zod验证并转换唯一查询条件
   *
   * @param where - 唯一查询条件
   * @returns 解析后的Prisma唯一查询条件
   * @private
   */
  private parseUniqueWhere(where: CompanyRoleWhereUniqueInput) {
    return CompanyRoleWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.CompanyRoleWhereUniqueInput;
  }

  /**
   * 解析创建数据
   *
   * 使用Zod验证并转换创建数据
   *
   * @param data - 创建数据
   * @returns 解析后的Prisma创建数据
   * @private
   */
  private parseCreateData(data: CompanyRoleCreateInput) {
    return CompanyRoleCreateInputObjectZodSchema.omit({
      members: true,
      admins: true,
    }).parse(data) as unknown as Prisma.CompanyRoleCreateInput;
  }

  /**
   * 解析更新数据
   *
   * 使用Zod验证并转换更新数据
   *
   * @param data - 更新数据
   * @returns 解析后的Prisma更新数据
   * @private
   */
  private parseUpdateData(data: CompanyRoleUpdateInput) {
    return CompanyRoleUpdateInputObjectZodSchema.parse(data) as unknown as Prisma.CompanyRoleUpdateInput;
  }

  /**
   * 解析排序条件
   *
   * 使用Zod验证并转换排序条件，支持单个排序条件或排序条件数组
   *
   * @param orderBy - 排序条件或排序条件数组
   * @returns 解析后的Prisma排序条件
   * @private
   */
  private parseOrderBy(orderBy: CompanyRoleOrderByWithRelationInput | CompanyRoleOrderByWithRelationInput[]) {
    if (Array.isArray(orderBy)) {
      return z
        .array(CompanyRoleOrderByWithRelationInputObjectZodSchema)
        .parse(orderBy) as unknown as Prisma.CompanyRoleOrderByWithRelationInput[];
    }
    return CompanyRoleOrderByWithRelationInputObjectZodSchema.parse(
      orderBy
    ) as unknown as Prisma.CompanyRoleOrderByWithRelationInput;
  }

  /**
   * 解析查询多个或第一个记录的参数
   *
   * 处理查询参数，包括包含关系、查询条件、排序、分页等
   *
   * @param args - 查询参数
   * @returns 处理后的查询参数对象
   * @private
   */
  private parseManyOrFirstArgs<T extends FindManyCompanyRoleArgs | FindFirstCompanyRoleArgs>(args: T) {
    return {
      ...args,
      where: args.where ? this.parseWhere(args.where) : undefined,
      orderBy: args.orderBy ? this.parseOrderBy(args.orderBy) : undefined,
      cursor: args.cursor ? this.parseUniqueWhere(args.cursor) : undefined,
    };
  }

  /**
   * 查找唯一企业角色记录
   *
   * 根据唯一条件查询单个企业角色记录
   *
   * @param where - 查询条件
   * @returns 企业角色记录或null
   */
  findUnique(where: FindUniqueCompanyRoleArgs['where']): Prisma.PrismaPromise<CompanyRole | null> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.companyRole.findUnique({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 查找第一个匹配的企业角色记录
   *
   * 根据条件查询第一个匹配的企业角色记录
   *
   * @param args - 查询参数
   * @returns 企业角色记录或null
   */
  findFirst(args: FindFirstCompanyRoleArgs): Prisma.PrismaPromise<CompanyRole | null> {
    args = this.parseManyOrFirstArgs(args);
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.companyRole.findFirst({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      ...args,
    });
  }

  /**
   * 查找多个企业角色记录
   *
   * 根据条件查询多个企业角色记录
   *
   * @param args - 查询参数
   * @returns 企业角色记录数组
   */
  findMany(args: FindManyCompanyRoleArgs): Prisma.PrismaPromise<CompanyRole[]> {
    args = this.parseManyOrFirstArgs(args);
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.companyRole.findMany({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      ...args,
    });
  }

  /**
   * 计算符合条件的企业角色记录数量
   *
   * @param where - 查询条件
   * @returns 记录数量
   */
  count(where?: FindManyCompanyRoleArgs['where']): Prisma.PrismaPromise<number> {
    return this.db.companyRole.count({
      where: where ? this.parseWhere(where) : undefined,
    });
  }

  /**
   * 创建企业角色记录
   *
   * @param data - 创建数据
   * @returns 创建的企业角色记录
   */
  create(data: CreateOneCompanyRoleArgs['data']): Prisma.PrismaPromise<CompanyRole> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.companyRole.create({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      data: this.handleParsedData(this.parseCreateData(data)),
    });
  }

  /**
   * 更新企业角色记录
   *
   * @param where - 更新条件
   * @param data - 更新数据
   * @returns 更新后的企业角色记录
   */
  update(
    where: UpdateOneCompanyRoleArgs['where'],
    data: UpdateOneCompanyRoleArgs['data']
  ): Prisma.PrismaPromise<CompanyRole> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.companyRole.update({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      data: this.handleParsedData(this.parseUpdateData(data)),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 更新或创建企业角色记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的企业角色记录
   */
  upsert(args: UpsertOneCompanyRoleArgs): Prisma.PrismaPromise<CompanyRole> {
    const include = this.getInclude();
    const select = this.getSelect();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.companyRole.upsert({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where,
      create,
      update,
    });
  }

  /**
   * 删除企业角色记录
   *
   * @param where - 删除条件
   * @returns 删除的企业角色记录
   */
  delete(where: DeleteOneCompanyRoleArgs['where']): Prisma.PrismaPromise<CompanyRole> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.companyRole.delete({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除企业角色记录
   *
   * @param where - 删除条件
   * @param limit - 限制删除数量
   * @returns 删除操作结果
   */
  deleteMany(where?: DeleteManyCompanyRoleArgs['where'], limit?: number) {
    return this.db.companyRole.deleteMany({
      where: where ? this.parseWhere(where) : undefined,
      limit,
    });
  }
}
