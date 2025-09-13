import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { Login, LoginInput } from 'src/auth/dto';
import { TokenFactory } from 'src/auth/factories';
import { DateHandler } from 'src/common/handlers';
import { Admin } from 'src/generated/graphql/admin';
import { Target } from 'src/generated/graphql/prisma';
import { User } from 'src/generated/graphql/user';
import { AdminRepository, AuthRepository, UserRepository } from 'src/repositories';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly auth: AuthRepository,
    private readonly user: UserRepository,
    private readonly admin: AdminRepository,
    private readonly tokenFactory: TokenFactory
  ) {}

  /**
   * 登录
   * @param input - 登录输入数据
   * @returns 登录结果
   */
  login(input: LoginInput) {
    try {
      const { target } = input;
      switch (target) {
        case Target.User:
          return this.loginUser(input);
        case Target.Admin:
          return this.loginAdmin(input);
      }
    } catch (error) {
      this.logger.error(error);
    }
    throw new UnprocessableEntityException({
      message: 'Invalid login credentials',
    });
  }
  logout() {
    return true;
  }

  /**
   * 用户登录
   * @param input - 登录输入数据
   * @returns 登录结果
   */
  private async loginUser(input: LoginInput): Promise<Login> {
    const { account, password, companyId } = input;
    let user: User | null = null;
    if (isEmail(account)) {
      user = await this.user.findByEmailAndCheckPassword(account, password);
    }
    if (!user) {
      throw new Error('Invalid account or password');
    }
    const { tokenId, token, expiredAt } = this.tokenFactory.create({
      target: Target.User,
      targetId: user.id,
      companyId: companyId,
    });
    if (!companyId) {
      throw new Error('you cannot login without company');
    }
    const auth = await this.auth.createByUser(user.id, companyId, {
      id: tokenId,
      token,
      expiredAt,
      target: Target.User,
    });
    return {
      target: Target.User,
      accessType: 'Bearer',
      accessToken: auth.token,
      accessTimeout: DateHandler(auth.createdAt).diff(auth.expiredAt, 'milliseconds'),
    };
  }

  /**
   * 管理员登录
   * @param input - 登录输入数据
   * @returns 登录结果
   */
  private async loginAdmin(input: LoginInput): Promise<Login> {
    const { account, password, companyId } = input;
    let admin: Admin | null = null;
    if (isEmail(account)) {
      admin = await this.admin.findByEmailAndCheckPassword(account, password);
    }
    if (!admin) {
      throw new Error('Invalid account or password');
    }
    const { tokenId, token, expiredAt } = this.tokenFactory.create({
      target: Target.Admin,
      targetId: admin.id,
      companyId: companyId,
    });
    const auth = await this.auth.createByAdmin(admin.id, companyId || null, {
      target: Target.Admin,
      id: tokenId,
      token,
      expiredAt,
    });
    return {
      target: Target.Admin,
      accessType: 'Bearer',
      accessToken: auth.token,
      accessTimeout: DateHandler(auth.createdAt).diff(auth.expiredAt, 'milliseconds'),
    };
  }
}
