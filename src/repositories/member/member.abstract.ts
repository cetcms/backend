import { Injectable } from '@nestjs/common';
import { Prisma, PrismaPromise } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  Member,
  MemberCreateInput,
  MemberOrderByWithRelationInput,
  MemberUpdateInput,
  MemberWhereInput,
  MemberWhereUniqueInput,
  CreateOneMemberArgs,
  DeleteManyMemberArgs,
  DeleteOneMemberArgs,
  FindFirstMemberArgs,
  FindManyMemberArgs,
  FindUniqueMemberArgs,
  UpdateOneMemberArgs,
  UpsertOneMemberArgs,
  Owner,
} from 'src/generated/graphql';
import {
  MemberCreateInputObjectZodSchema,
  MemberIncludeObjectZodSchema,
  MemberOrderByWithRelationInputObjectZodSchema,
  MemberSelectObjectZodSchema,
  MemberUpdateInputObjectZodSchema,
  MemberWhereInputObjectZodSchema,
  MemberWhereUniqueInputObjectZodSchema,
} from 'src/generated/schemas';
import { z } from 'zod';

/**
 * 成员数据访问抽象类
 *
 * 该抽象类提供了对成员数据的基本CRUD操作，包括查询、创建、更新、删除等功能。
 * 所有操作都通过Prisma ORM进行，并使用Zod进行数据验证。
 * 继承此类的具体实现需要提供handleParsedData方法的实现。
 */

@Injectable()
export abstract class MemberAbstract {
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
  protected abstract handleParsedData<T extends Prisma.MemberCreateInput | Prisma.MemberUpdateInput>(input: T): T;

  /**
   * 包含关系配置
   *
   * 用于指定查询时需要包含的关联数据
   */
  protected include: Prisma.MemberInclude = {};

  /**
   * 选择字段配置
   *
   * 用于指定查询时需要选择的字段
   */
  protected select: Prisma.MemberSelect = {};

  /**
   * 设置包含关系
   *
   * 设置查询时需要包含的关联数据
   *
   * @param include - 包含关系配置对象
   * @returns 当前实例，支持链式调用
   */
  setInclude(include?: Prisma.MemberInclude) {
    this.include = MemberIncludeObjectZodSchema.parse(include) as Prisma.MemberInclude;
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
  setSelect(select?: Prisma.MemberSelect) {
    this.select = MemberSelectObjectZodSchema.parse(select) as Prisma.MemberSelect;
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
  private parseWhere(where: MemberWhereInput) {
    return MemberWhereInputObjectZodSchema.parse(where) as unknown as Prisma.MemberWhereInput;
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
  private parseUniqueWhere(where: MemberWhereUniqueInput) {
    return MemberWhereUniqueInputObjectZodSchema.parse(where) as unknown as Prisma.MemberWhereUniqueInput;
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
  private parseCreateData(data: MemberCreateInput) {
    const result = MemberCreateInputObjectZodSchema.omit({
      companies: true,
      auths: true,
      logs: true,
      mediaFiles: true,
      mediaFolders: true,
      notifications: true,
      notificationRecipients: true,
    }).parse(data) as unknown as Prisma.MemberCreateInput;
    result.mediaFolders = {
      create: { name: 'root', path: '/', owner: Owner.Company },
    };
    return result;
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
  private parseUpdateData(data: MemberUpdateInput) {
    return MemberUpdateInputObjectZodSchema.omit({
      companies: true,
      auths: true,
      logs: true,
      mediaFiles: true,
      mediaFolders: true,
      notifications: true,
      notificationRecipients: true,
    }).parse(data) as unknown as Prisma.MemberUpdateInput;
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
  private parseOrderBy(orderBy: MemberOrderByWithRelationInput | MemberOrderByWithRelationInput[]) {
    if (!Array.isArray(orderBy)) {
      orderBy = [orderBy];
    }
    return z
      .array(MemberOrderByWithRelationInputObjectZodSchema)
      .parse(orderBy) as unknown as Prisma.MemberOrderByWithRelationInput[];
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
  private parseManyOrFirstArgs<T extends FindManyMemberArgs | FindFirstMemberArgs>(args: T) {
    return {
      ...args,
      where: args.where ? this.parseWhere(args.where) : undefined,
      orderBy: args.orderBy ? this.parseOrderBy(args.orderBy) : undefined,
      cursor: args.cursor ? this.parseUniqueWhere(args.cursor) : undefined,
    };
  }

  /**
   * 查找唯一成员记录
   *
   * 根据唯一条件查询单个成员记录
   *
   * @param where - 查询条件
   * @returns 成员记录或null
   */
  findUnique(where: FindUniqueMemberArgs['where']): PrismaPromise<Member | null> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.member.findUnique({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 查找第一个匹配的成员记录
   *
   * 根据条件查询第一个匹配的成员记录
   *
   * @param args - 查询参数
   * @returns 成员记录或null
   */
  findFirst(args: FindFirstMemberArgs): PrismaPromise<Member | null> {
    args = this.parseManyOrFirstArgs(args);
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.member.findFirst({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      ...args,
    });
  }

  /**
   * 查找多个成员记录
   *
   * 根据条件查询多个成员记录
   *
   * @param args - 查询参数
   * @returns 成员记录数组
   */
  findMany(args: FindManyMemberArgs): PrismaPromise<Member[]> {
    args = this.parseManyOrFirstArgs(args);
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.member.findMany({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      ...args,
    });
  }

  /**
   * 计算符合条件的成员记录数量
   *
   * @param where - 查询条件
   * @returns 记录数量
   */
  count(where?: FindManyMemberArgs['where']): PrismaPromise<number> {
    return this.db.member.count({
      where: where ? this.parseWhere(where) : undefined,
    });
  }

  /**
   * 创建成员记录
   *
   * @param data - 创建数据
   * @returns 创建的成员记录
   */
  create(data: CreateOneMemberArgs['data']): PrismaPromise<Member> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.member.create({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      data: this.parseCreateData(data),
    });
  }

  /**
   * 更新成员记录
   *
   * @param where - 更新条件
   * @param data - 更新数据
   * @returns 更新后的成员记录
   */
  update(where: UpdateOneMemberArgs['where'], data: UpdateOneMemberArgs['data']): PrismaPromise<Member> {
    const include = this.getInclude();
    const select = this.getSelect();
    const update = this.handleParsedData(this.parseUpdateData(data));
    return this.db.member.update({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
      data: update,
    });
  }

  /**
   * 更新或创建成员记录
   *
   * 如果记录存在则更新，不存在则创建
   *
   * @param args - 更新或创建参数
   * @returns 更新或创建后的成员记录
   */
  upsert(args: UpsertOneMemberArgs): PrismaPromise<Member> {
    const include = this.getInclude();
    const select = this.getSelect();
    const where = this.parseUniqueWhere(args.where);
    const create = this.handleParsedData(this.parseCreateData(args.create));
    const update = this.handleParsedData(this.parseUpdateData(args.update));
    return this.db.member.upsert({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where,
      create,
      update,
    });
  }

  /**
   * 删除成员记录
   *
   * @param where - 删除条件
   * @returns 删除的成员记录
   */
  delete(where: DeleteOneMemberArgs['where']): PrismaPromise<Member> {
    const include = this.getInclude();
    const select = this.getSelect();
    return this.db.member.delete({
      ...(Object.keys(include).length > 0 && { include }),
      ...(Object.keys(select).length > 0 && { select }),
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除成员记录
   *
   * @param where - 删除条件
   * @param limit - 限制删除数量
   * @returns 删除操作结果
   */
  deleteMany(where?: DeleteManyMemberArgs['where'], limit?: number) {
    return this.db.member.deleteMany({
      where: where ? this.parseWhere(where) : undefined,
      limit,
    });
  }
}
