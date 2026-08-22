import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { CurrentAuth } from 'src/auth/decorators';
import { ConfigService } from 'src/config';
import { SystemContract } from 'src/contracts';
import { Auth } from 'src/generated/graphql/auth';
import { Client, Target } from 'src/generated/graphql/prisma';
import { Permissions } from 'src/generated/permissions';
import { AuthRepository, AdminCompanyRepository, CompanyMemberRepository } from 'src/repositories';

import { TokenFactory } from '../factories';
import { JwtPayload } from '../interfaces';

/**
 * JWT 策略
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * 构造函数
   */
  constructor(
    private readonly auth: AuthRepository,
    private readonly adminCompany: AdminCompanyRepository,
    private readonly companyMember: CompanyMemberRepository,
    private readonly configService: ConfigService,
    private readonly factory: TokenFactory
  ) {
    const jwtConfig = configService.getAppConfig().jwt;
    if (!jwtConfig.secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  /**
   * 验证 JWT Token
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
   */
  private async rolePermissions(auth: Auth) {
    const result: Omit<CurrentAuth, keyof Auth> = {
      adminRole: undefined,
      companyRole: undefined,
      permissions: [],
    };

    // 管理员登录企业
    if (auth.admin && auth.companyId) {
      result.adminRole = auth.admin?.role;
      // 根管理员
      if (result.adminRole?.code === SystemContract.RootAdminRole) {
        result.permissions =
          Permissions.filter((p) => {
            return p.clients.includes(Client.Company) || p.clients.length === 0;
          }).map((p) => p.name) || [];
      } else {
        // 非根管理员
        const adminCompany = await this.adminCompany
          .setInclude({ role: true })
          .findOneByUnique(auth.admin.id, auth.companyId);
        result.companyRole = adminCompany?.role;
        result.permissions = adminCompany?.role?.permissions || [];
      }
      return result;
    }

    // 成员登录企业
    if (auth.memberId && auth.companyId) {
      const companyMember = await this.companyMember
        .setInclude({ role: true })
        .findOneByUnique(auth.memberId, auth.companyId);
      result.companyRole = companyMember?.role;
      result.permissions = companyMember?.role?.permissions || [];
      return result;
    }

    // 管理员
    if (auth.admin) {
      result.adminRole = auth.admin?.role;
      result.permissions = auth.admin.role?.permissions || [];
      return result;
    }

    // 成员
    if (auth.memberId) {
      result.permissions =
        Permissions.filter((p) => {
          return p.clients.includes(Client.Member) || p.clients.length === 0;
        }).map((p) => p.name) || [];
      return result;
    }
  }
}
