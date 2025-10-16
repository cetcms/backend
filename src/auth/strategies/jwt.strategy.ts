import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CurrentAuth } from 'src/auth/decorators';
import { ConfigService } from 'src/config';
import { Auth } from 'src/generated/graphql/auth';
import { Target } from 'src/generated/graphql/prisma';
import {
  AdminRepository,
  MemberRepository,
  AuthRepository,
  AdminCompanyRepository,
  CompanyMemberRepository,
} from 'src/repositories';

import { TokenFactory } from '../factories';
import { JwtPayload } from '../interfaces';

/**
 * JWT 策略
 *
 * 功能描述：
 * - 基于 Passport JWT 策略实现认证逻辑
 * - 验证 Token 并获取成员信息
 * - 构建成员权限列表
 *
 * 核心功能：
 * - validate: 验证 JWT Token
 * - authPermissions: 构建成员权限列表
 *
 * 依赖组件：
 * - AuthService: 认证服务
 * - TokenFactory: Token 工厂
 * - 多个数据库仓储：用于获取成员和权限信息
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
   * - member: MemberRepository - 成员仓储
   * - adminCompany: AdminCompanyRepository - 管理员公司仓储
   * - companyMember: CompanyMemberRepository - 公司成员仓储
   * - factory: TokenFactory - Token 工厂
   */
  constructor(
    private readonly auth: AuthRepository,
    private readonly admin: AdminRepository,
    private readonly member: MemberRepository,
    private readonly adminCompany: AdminCompanyRepository,
    private readonly companyMember: CompanyMemberRepository,
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
   * - 根据 Token 获取成员信息
   * - 返回成员对象和认证信息
   *
   * 参数说明：
   * - payload: JwtPayload - JWT 载荷
   *
   * 返回值说明：
   * - Promise<[Admin | Member, CurrentAuth> - 成员对象和认证信息
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
      member: true,
    });
    const auth = await this.auth.findOneById(options.tokenId);
    if (!auth) {
      throw new UnauthorizedException({
        message: 'Invalid token',
        code: 'TOKEN_INVALID',
      });
    }
    const rolePermissions = await this.rolePermissions(auth);
    const currentAuth: CurrentAuth = { ...auth, ...rolePermissions };
    if (options?.target === Target.Admin && auth && auth.admin) {
      return [auth.admin, currentAuth];
    }
    if (options?.target === Target.Member && auth && auth.member) {
      return [auth.member, currentAuth];
    }
    throw new UnauthorizedException({
      message: 'Invalid token',
      code: 'TOKEN_INVALID',
    });
  }

  /**
   * 构建角色权限列表
   *
   * 功能描述：
   * - 根据成员类型和关联信息构建权限列表
   * - 支持管理员和成员权限获取
   *
   * 核心逻辑：
   * - 管理员：获取角色权限并合并企业权限
   * - 成员：根据成员ID和企业ID获取角色权限
   *
   * 异常处理：
   * - 未找到管理员或成员：返回空权限列表
   *
   * 参数说明：
   * - auth: Auth - 认证信息
   *
   * 返回值说明：
   * - Promise<string[]> - 权限列表
   */
  private async rolePermissions(auth: Auth) {
    const result: Omit<CurrentAuth, keyof Auth> = {
      adminRole: undefined,
      companyRole: undefined,
      permissions: [],
      adminRolePermissions: [],
      companyRolePermissions: [],
    };
    if (auth.admin) {
      result.adminRole = auth.admin?.role;
      result.adminRolePermissions = auth.admin.role?.permissions || [];
      result.permissions = [...result.adminRolePermissions];
      if (auth.company) {
        const adminCompany = await this.adminCompany
          .setInclude({ role: true })
          .findOneByUnique(auth.admin.id, auth.company.id);
        result.companyRole = adminCompany?.role;
        result.companyRolePermissions = adminCompany?.role?.permissions || [];
        result.permissions = [...result.adminRolePermissions, ...result.companyRolePermissions];
      }
      return result;
    }
    if (auth.member && auth.company) {
      const companyMember = await this.companyMember
        .setInclude({ role: true })
        .findOneByUnique(auth.member.id, auth.company.id);
      result.companyRole = companyMember?.role;
      result.companyRolePermissions = companyMember?.role?.permissions || [];
      result.permissions = [...result.companyRolePermissions];
    }
    return result;
  }
}
