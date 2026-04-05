<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# CETCMS - 企业内容管理系统

<p align="center">基于 NestJS 构建的企业级 CMS 后端系统</p>

## 项目简介

CETCMS 是一个功能丰富的企业内容管理系统，支持：

- **多租户架构** - 支持多企业/组织隔离
- **权限管理** - 基于 RBAC 的细粒度权限控制
- **媒体管理** - 支持多种存储后端（本地、七牛、OSS、S3 等）
- **GraphQL API** - 现代化的 API 设计
- **多语言支持** - 基于 i18next 的国际化方案
- **通知系统** - 站内消息和通知管理

## 技术栈

- **框架**: [NestJS](https://nestjs.com/) + TypeScript
- **数据库**: PostgreSQL + Prisma ORM
- **API**: GraphQL (Apollo Server) + REST
- **缓存**: Redis + 内存缓存
- **认证**: JWT + Passport
- **运行时**: Bun

## 快速开始

### 环境要求

- Bun >= 1.0
- PostgreSQL >= 14
- Redis >= 6

### 安装依赖

```bash
bun install
```

### 环境配置

复制 `.env.example` 为 `.env` 并配置：

```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/cetcms?schema=public"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### 数据库迁移

```bash
bun run db:migrate
bun run db:seed
```

### 开发运行

```bash
# 开发模式（热重载）
bun run dev

# 调试模式
bun run debug
```

### 生产构建

```bash
bun run build
bun run prod
```

## 项目结构

```
src/
├── auth/              # 认证模块（JWT、Guard、装饰器）
├── cache/             # 缓存配置（Redis + 内存）
├── common/            # 共享工具、过滤器、拦截器
├── config/            # 配置服务
├── database/          # Prisma 数据库服务
├── generated/         # 自动生成的 DTO 和 GraphQL 类型
├── i18n/              # 国际化配置
├── modules/           # 业务模块
│   ├── admin/         # 管理员管理
│   ├── company/       # 企业管理
│   ├── media/         # 媒体文件管理
│   ├── member/        # 成员管理
│   ├── notification/  # 通知系统
│   └── website/       # 网站管理
├── providers/         # 外部服务提供商
│   ├── site/          # 站点爬虫
│   └── strapi/        # Strapi CMS 集成
└── repositories/      # 数据访问层（Prisma 扩展）
```

## 常用命令

```bash
# 数据库操作
bun run db:migrate        # 运行迁移
bun run db:push           # 推送 schema 变更
bun run db:studio         # 打开 Prisma Studio
bun run db:seed           # 种子数据

# 代码生成
bun run generate          # 生成 Prisma Client 和 DTO

# 脚本
bun run script:scan-permissions          # 扫描权限
bun run script:push-permissions-to-role  # 推送权限到角色
bun run script:gen-i18n-translations     # 生成翻译文件

# 测试
bun run test              # 单元测试
bun run test:e2e          # E2E 测试
bun run test:cov          # 测试覆盖率

# 代码质量
bun run lint              # ESLint 检查
bun run format            # Prettier 格式化
```

## API 文档

启动服务后访问：

- GraphQL Playground: http://localhost:3325/graphql
- Swagger UI: http://localhost:3325/api-docs

## 性能测试

```bash
autocannon http://localhost:3325/api \
  -c 10 \
  -d 5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 许可证

[MIT](LICENSE)
