import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { TokenFactory } from 'src/auth/factories';
import { Login, LoginInput, LoginMeta } from 'src/auth/graphql';
import { DateHandler } from 'src/common/handlers';
import { FindManyCompanyArgs } from 'src/generated/graphql';
import { Admin } from 'src/generated/graphql/admin';
import { Auth } from 'src/generated/graphql/auth';
import { Target } from 'src/generated/graphql/prisma';
import { User } from 'src/generated/graphql/user';
import { AdminRepository, AuthRepository, CompanyRepository, UserRepository } from 'src/repositories';

/**
 * 认证服务类
 * 提供用户登录、登出等认证相关功能
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly auth: AuthRepository,
    private readonly user: UserRepository,
    private readonly admin: AdminRepository,
    private readonly company: CompanyRepository,
    private readonly tokenFactory: TokenFactory
  ) {}

  /**
   * 处理目标对象
   * @param target
   * @param targetId
   * @param meta
   * @param companyId
   * @private
   */
  private async targetLogin(target: Target, targetId: string, meta: LoginMeta, companyId?: string) {
    // 使用令牌工厂创建认证令牌相关信息
    const { tokenId, token, expiredAt } = this.tokenFactory.create({
      target: target,
      targetId: targetId,
      companyId: companyId,
    });
    // 创建认证记录
    const auth = await this.auth.createByTarget(targetId, companyId || null, {
      fingerprint: meta.fingerprint || undefined,
      location: undefined,
      device: undefined,
      id: tokenId,
      expiredAt,
      target,
      token,
    });
    // 返回登录结果
    return {
      target: target,
      accessType: 'Bearer',
      accessToken: auth.token,
      accessTimeout: DateHandler(auth.expiredAt).diff(auth.createdAt, 'milliseconds'),
    };
  }
  /**
   * 用户登录方法
   * @param input - 登录输入数据，包含账户、密码、目标类型和公司ID
   * @param meta - 元数据信息
   * @returns 登录结果，包含访问令牌和相关信息
   */
  async login(input: LoginInput, meta: LoginMeta): Promise<Login> {
    // 如果未指定目标类型，默认设置为用户类型
    if (!input.target) input.target = Target.User;

    // 初始化目标对象（管理员或用户）
    let target: Admin | User | null = null;

    // 根据目标类型获取对应的仓库
    const repo = input.target === Target.Admin ? this.admin : this.user;

    // 如果输入的账户是邮箱格式，则通过邮箱和密码查找用户
    if (isEmail(input.account)) {
      target = await repo.findByEmailAndCheckPassword(input.account, input.password);
    }

    // 如果未找到匹配的用户或密码错误，则抛出异常
    if (!target) {
      throw new UnprocessableEntityException('Invalid login credentials');
    }

    try {
      // 删除所有与目标相关的认证记录
      await this.auth.deleteByTarget(input.target, target.id);
      // 创建新的认证记录
      return await this.targetLogin(input.target, target.id, meta, input.companyId);
    } catch (error) {
      // 打印错误日志
      this.logger.error(error);
      // 捕获创建认证记录时的异常并重新抛出
      throw new UnprocessableEntityException('Invalid login credentials');
    }
  }

  /**
   * 用户登出方法
   * @returns 登出结果
   */
  async logout(auth: Auth) {
    try {
      return Boolean(await this.auth.deleteById(auth.id));
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  listCompanies(auth: Auth, name?: string) {
    const args: FindManyCompanyArgs = { take: 5 };
    // 构建查询条件
    let where: FindManyCompanyArgs['where'] = {};
    // 根据目标类型构建查询条件: 管理员
    if (auth.target === Target.Admin && auth.adminId) {
      where = { admins: { some: { adminId: { equals: auth.adminId } } } };
    }
    // 根据目标类型构建查询条件: 用户
    if (auth.target === Target.User && auth.userId) {
      where = { users: { some: { userId: { equals: auth.userId } } } };
    }
    // 如果指定了名称，则添加名称模糊匹配条件
    if (name) {
      args.where = {
        OR: [
          { name: { contains: name, mode: 'insensitive' }, ...where },
          { alias: { contains: name, mode: 'insensitive' }, ...where },
        ],
      };
    }
    // 返回公司列表
    return this.company.findMany(args);
  }

  switchCompany(auth: Auth, meta: LoginMeta, companyId: string) {
    const target = auth.target as Target;
    const targetId = target === Target.Admin ? auth.adminId : auth.userId;
    try {
      this.auth.deleteByTarget(target, String(targetId));
      return this.targetLogin(auth.target as Target, String(targetId), meta, companyId);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
