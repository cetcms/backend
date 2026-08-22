import { OnModuleDestroy, OnModuleInit, Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';

/**
 * Prisma 数据库服务
 * 提供数据库连接和事务管理功能
 *
 * @description 该服务扩展了 PrismaClient，提供了模块生命周期管理、
 * 配置注入和连接池管理功能。支持查询日志、连接超时和自定义配置。
 */
@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    const adapter = new PrismaPg({ connectionString: url });
    super({ adapter });
  }

  /**
   * 模块初始化时连接数据库
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * 模块销毁时断开数据库连接
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
