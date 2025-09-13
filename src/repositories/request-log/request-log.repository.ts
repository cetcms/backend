import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database';
import {
  RequestLog,
  RequestLogWhereInput,
  RequestLogCreateInput,
  RequestLogUpdateInput,
  RequestLogWhereUniqueInput,
  RequestLogOrderByWithRelationInput,
} from 'src/generated/graphql/request-log';
import {
  RequestLogCreateInputObjectZodSchema,
  RequestLogUpdateInputObjectSchema,
  RequestLogWhereInputObjectSchema,
  RequestLogWhereUniqueInputObjectSchema,
} from 'src/generated/schemas';

type PickWhereUniqueFields = 'id';

/**
 * 请求日志数据访问层
 * 提供对请求日志的完整 CRUD 操作
 *
 * @description 该仓库类封装了所有与请求日志相关的数据库操作，
 * 包括查询、创建、更新、删除等功能，并提供了分页查询和批量操作的支持。
 * 支持按用户、管理员、公司、IP、路由等多维度查询和统计分析。
 */
@Injectable()
export class RequestLogRepository {
  constructor(private readonly db: DatabaseService) {}

  /** 关联查询配置，用于指定查询时需要包含的关联数据 */
  private include: Prisma.RequestLogInclude = {};

  /**
   * 设置关联查询配置
   * @param include - Prisma 关联查询配置对象
   */
  setInclude(include: Prisma.RequestLogInclude) {
    this.include = include;
    return this;
  }

  /**
   * 处理输入数据
   * @param input - 输入数据
   */
  private handleInputData(input: RequestLogCreateInput | RequestLogUpdateInput) {
    // 此repository暂时不需要特殊处理输入数据
    return input;
  }

  /**
   * 解析创建数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 创建请求日志的输入数据
   * @returns 解析后的创建数据
   */
  private parseCreateData(input: RequestLogCreateInput) {
    return RequestLogCreateInputObjectZodSchema.parse(input) as unknown as Prisma.RequestLogCreateInput;
  }

  /**
   * 解析更新数据，验证输入数据是否符合 Prisma 模型定义
   * @param input - 更新请求日志的输入数据
   * @returns 解析后的更新数据
   */
  private parseUpdateData(input: RequestLogUpdateInput) {
    return RequestLogUpdateInputObjectSchema.parse(input) as unknown as Prisma.RequestLogUpdateInput;
  }

  /**
   * 解析查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 查询条件
   * @returns 解析后的查询条件
   */
  private parseManyWhere(where: RequestLogWhereInput) {
    return RequestLogWhereInputObjectSchema.parse(where) as unknown as Prisma.RequestLogWhereInput;
  }

  /**
   * 解析唯一查询条件，验证输入数据是否符合 Prisma 模型定义
   * @param where - 唯一查询条件
   * @returns 解析后的唯一查询条件
   */
  private parseUniqueWhere(where: RequestLogWhereUniqueInput) {
    return RequestLogWhereUniqueInputObjectSchema.parse(where) as unknown as Prisma.RequestLogWhereUniqueInput;
  }

  /**
   * 根据用户 ID 查找所有请求日志
   * @param userId - 用户唯一标识符
   * @returns 该用户的所有请求日志列表
   */
  findByUserId(userId: string) {
    return this.findMany({ userId: { equals: userId } });
  }

  /**
   * 根据管理员 ID 查找所有请求日志
   * @param adminId - 管理员唯一标识符
   * @returns 该管理员的所有请求日志列表
   */
  findByAdminId(adminId: string) {
    return this.findMany({ adminId: { equals: adminId } });
  }

  /**
   * 根据公司 ID 查找所有请求日志
   * @param companyId - 公司唯一标识符
   * @returns 该公司的所有请求日志列表
   */
  findByCompanyId(companyId: string) {
    return this.findMany({ companyId: { equals: companyId } });
  }

  /**
   * 根据 IP 地址查找请求日志
   * @param ip - IP 地址
   * @returns 该 IP 地址的所有请求日志列表
   */
  findByIp(ip: string) {
    return this.findMany({ ip: { equals: ip } });
  }

  /**
   * 根据路由查找请求日志
   * @param route - API 路由路径
   * @returns 该路由的所有请求日志列表
   */
  findByRoute(route: string) {
    return this.findMany({ route: { equals: route } });
  }

  /**
   * 根据日期范围查找请求日志
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @returns 指定日期范围内的请求日志列表
   */
  findByDateRange(startDate: Date, endDate: Date) {
    return this.findMany({
      recordAt: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  /**
   * 根据请求日志 ID 查找记录
   * @param id - 请求日志唯一标识符
   * @returns 匹配的请求日志记录或 null
   */
  findById(id: string) {
    return this.findUnique({ id });
  }

  /**
   * 根据请求日志 ID 更新记录
   * @param id - 请求日志唯一标识符
   * @param input - 更新数据
   * @returns 更新后的请求日志记录
   */
  updateById(id: string, input: RequestLogUpdateInput): Promise<RequestLog> {
    return this.update({ id }, input);
  }

  /**
   * 分页查询请求日志
   * @param skip - 跳过的记录数量（默认为 0）
   * @param take - 获取的记录数量（默认为 10）
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 包含总数和请求日志列表的数组 [总数, 日志列表]
   */
  findWithPagination(
    skip: number = 0,
    take: number = 10,
    where?: RequestLogWhereInput,
    orderBy?: RequestLogOrderByWithRelationInput
  ) {
    return Promise.all([this.count(where), this.findMany(where, orderBy, skip, take)]);
  }

  /**
   * 查找第一个匹配的请求日志
   * @param where - 查询条件
   * @param orderBy - 排序条件
   * @returns 第一个匹配的请求日志记录或 null
   */
  findFirst(where?: RequestLogWhereInput, orderBy?: RequestLogOrderByWithRelationInput): Promise<RequestLog | null> {
    const args: Prisma.RequestLogFindFirstArgs = {
      include: this.include,
      orderBy,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.requestLog.findFirst(args);
  }

  /**
   * 根据唯一条件查找请求日志
   * @param where - 唯一查询条件（只能使用 id）
   * @returns 匹配的请求日志记录或 null
   */
  findUnique(where: Pick<RequestLogWhereUniqueInput, PickWhereUniqueFields>): Promise<RequestLog | null> {
    return this.db.requestLog.findUnique({
      where: this.parseUniqueWhere(where),
      include: this.include,
    });
  }

  /**
   * 查询多个请求日志
   * @param where - 查询条件（可选）
   * @param orderBy - 排序条件（可选）
   * @param skip - 跳过的记录数量（可选）
   * @param take - 获取的记录数量（可选）
   * @returns 符合条件的请求日志列表
   */
  findMany(
    where?: RequestLogWhereInput,
    orderBy?: RequestLogOrderByWithRelationInput,
    skip?: number,
    take?: number
  ): Promise<RequestLog[]> {
    const args: Prisma.RequestLogFindManyArgs = {
      include: this.include,
      orderBy,
      skip,
      take,
    };
    if (where) args.where = this.parseManyWhere(where);
    return this.db.requestLog.findMany(args);
  }

  /**
   * 统计符合条件的请求日志数量
   * @param where - 查询条件（可选）
   * @returns 符合条件的记录总数
   */
  count(where?: RequestLogWhereInput): Promise<number> {
    const args: Prisma.RequestLogCountArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.requestLog.count(args);
  }

  /**
   * 更新请求日志
   * @param where - 唯一查询条件（只能使用 id）
   * @param input - 更新数据
   * @returns 更新后的请求日志记录
   */
  update(
    where: Pick<RequestLogWhereUniqueInput, PickWhereUniqueFields>,
    input: RequestLogUpdateInput
  ): Promise<RequestLog> {
    this.handleInputData(input);
    return this.db.requestLog.update({
      where: this.parseUniqueWhere(where),
      data: this.parseUpdateData(input),
      include: this.include,
    });
  }

  /**
   * 创建新的请求日志
   * @param input - 创建请求日志所需的数据
   * @returns 创建的请求日志记录
   */
  create(input: RequestLogCreateInput): Promise<RequestLog> {
    this.handleInputData(input);
    return this.db.requestLog.create({
      data: this.parseCreateData(input),
      include: this.include,
    });
  }

  /**
   * 创建或更新请求日志（如果存在则更新，不存在则创建）
   * @param where - 唯一查询条件
   * @param input - 创建/更新数据
   * @returns 创建或更新后的请求日志记录
   */
  upsert(
    where: Pick<RequestLogWhereUniqueInput, PickWhereUniqueFields>,
    input: RequestLogCreateInput
  ): Promise<RequestLog> {
    this.handleInputData(input);
    const data = this.parseCreateData(input);
    return this.db.requestLog.upsert({
      where: this.parseUniqueWhere(where),
      update: data,
      create: data,
      include: this.include,
    });
  }

  /**
   * 删除请求日志
   * @param where - 唯一查询条件（只能使用 id）
   * @returns 删除的请求日志记录
   */
  delete(where: Pick<RequestLogWhereUniqueInput, PickWhereUniqueFields>): Promise<RequestLog> {
    return this.db.requestLog.delete({
      where: this.parseUniqueWhere(where),
    });
  }

  /**
   * 批量删除请求日志
   * @param where - 查询条件（可选，不指定则删除所有记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteMany(where?: RequestLogWhereInput) {
    const args: Prisma.RequestLogDeleteManyArgs = {};
    if (where) args.where = this.parseManyWhere(where);
    return this.db.requestLog.deleteMany(args);
  }

  /**
   * 根据用户 ID 删除该用户的所有请求日志
   * @param userId - 用户唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByUserId(userId: string) {
    return this.deleteMany({ userId: { equals: userId } });
  }

  /**
   * 根据管理员 ID 删除该管理员的所有请求日志
   * @param adminId - 管理员唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByAdminId(adminId: string) {
    return this.deleteMany({ adminId: { equals: adminId } });
  }

  /**
   * 根据公司 ID 删除该公司的所有请求日志
   * @param companyId - 公司唯一标识符
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteAllByCompanyId(companyId: string) {
    return this.deleteMany({ companyId: { equals: companyId } });
  }

  /**
   * 根据日期范围删除请求日志（用于日志清理）
   * @param beforeDate - 截止日期（删除此日期之前的记录）
   * @returns 删除操作的结果，包含删除的记录数量
   */
  deleteOldLogs(beforeDate: Date) {
    return this.deleteMany({ recordAt: { lt: beforeDate } });
  }
}
