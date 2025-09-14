import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from 'src/config';
import { Auth } from 'src/generated/graphql/auth';
import { Target } from 'src/generated/graphql/prisma';
import {
  AdminRepository,
  UserRepository,
  AuthRepository,
  AdminCompanyRepository,
  CompanyUserRepository,
} from 'src/repositories';

import { TokenFactory } from '../factories';
import { JwtPayload } from '../interfaces';

/**
 * JWT 策略
 *
 * 功能描述：
 * - 基于 Passport JWT 策略实现认证逻辑
 * - 验证 Token 并获取用户信息
 * - 构建用户权限列表
 *
 * 核心功能：
 * - validate: 验证 JWT Token
 * - authPermissions: 构建用户权限列表
 *
 * 依赖组件：
 * - AuthService: 认证服务
 * - TokenFactory: Token 工厂
 * - 多个数据库仓储：用于获取用户和权限信息
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * 构造函数
   *
   * 参数说明：
   * - service: AuthService - 认证服务
   * - auth: AuthRepository - 认证仓储
   * - admin: AdminRepository - 管理员仓储
   * - user: UserRepository - 用户仓储
   * - adminCompany: AdminCompanyRepository - 管理员公司仓储
   * - companyUser: CompanyUserRepository - 公司用户仓储
   * - factory: TokenFactory - Token 工厂
   */
  constructor(
    private readonly auth: AuthRepository,
    private readonly admin: AdminRepository,
    private readonly user: UserRepository,
    private readonly adminCompany: AdminCompanyRepository,
    private readonly companyUser: CompanyUserRepository,
    private readonly configService: ConfigService,
    private readonly factory: TokenFactory
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getAppConfig().jwt.secret,
    });
  }

  /**
   * 验证 JWT Token
   *
   * 功能描述：
   * - 验证 JWT Token 的有效性
   * - 根据 Token 获取用户信息
   * - 返回用户对象和认证信息
   *
   * 参数说明：
   * - payload: JwtPayload - JWT 载荷
   *
   * 返回值说明：
   * - Promise<[Admin | User, Auth & { permissions: string[] }]> - 用户对象和认证信息
   */
  async validate(payload: JwtPayload) {
    const options = this.factory.serialize(payload);
    if (!options || !options.tokenId) {
      throw new UnauthorizedException({
        message: 'Invalid token',
        code: 'TOKEN_INVALID',
      });
    }
    this.auth.setInclude({
      admin: { include: { role: true } },
      company: true,
      user: true,
    });
    const auth = await this.auth.findOneById(options.tokenId);
    if (!auth) {
      throw new UnauthorizedException({
        message: 'Invalid token',
        code: 'TOKEN_INVALID',
      });
    }
    const permissions = await this.authPermissions(auth);
    if (options?.target === Target.Admin && auth && auth.admin) {
      return [auth.admin, { ...auth, permissions }];
    }
    if (options?.target === Target.User && auth && auth.user) {
      return [auth.user, { ...auth, permissions }];
    }
    throw new UnauthorizedException({
      message: 'Invalid token',
      code: 'TOKEN_INVALID',
    });
  }

  /**
   * 构建用户权限列表
   *
   * 功能描述：
   * - 根据用户类型和关联信息构建权限列表
   * - 支持管理员和用户权限获取
   *
   * 核心逻辑：
   * - 管理员：获取角色权限并合并企业权限
   * - 用户：根据用户ID和企业ID获取角色权限
   *
   * 异常处理：
   * - 未找到管理员或用户：返回空权限列表
   *
   * 参数说明：
   * - auth: Auth - 认证信息
   *
   * 返回值说明：
   * - Promise<string[]> - 权限列表
   */
  private async authPermissions(auth: Auth) {
    if (auth.admin) {
      const permissions = auth.admin?.role?.permissions || [];
      if (auth.company) {
        const adminCompany = await this.adminCompany.findOneByUnique(auth.admin.id, auth.company.id);
        return [...permissions, ...(adminCompany?.permissions || [])];
      }
      return permissions;
    }
    if (auth.user && auth.company) {
      const companyUser = await this.companyUser
        .setInclude({ role: true })
        .findOneByUnique(auth.user.id, auth.company.id);
      return companyUser?.role?.permissions || [];
    }
    return [];
  }
}
