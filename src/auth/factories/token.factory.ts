import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DateHandler, TimeHandler } from 'src/common/handlers';
import { ConfigService } from 'src/config';
import { Target } from 'src/generated/graphql/prisma';
import { v7 as uuid } from 'uuid';

import { JwtPayload, TokenPayload } from '../interfaces';

/**
 * Token 工厂
 *
 * 功能描述：
 * - 提供 Token 的创建、验证和解析功能
 * - 基于 JWT 实现 Token 管理
 * - 支持自定义过期时间和密钥
 *
 * 核心功能：
 * - create: 创建 Token
 * - verify: 验证 Token
 * - decode: 解析 Token
 * - serialize: 序列化 JWT 载荷
 */
@Injectable()
export class TokenFactory {
  /**
   * JWT 密钥
   *
   * 说明：从认证配置中获取的默认 JWT 密钥
   */
  private readonly jwtSecret: string;

  /**
   * JWT 过期时间
   *
   * 说明：从认证配置中获取的默认过期时间
   */
  private readonly jwtExpiresIn: string;

  /**
   * 构造函数
   *
   * 参数说明：
   * - jwtService: JwtService - NestJS JWT 服务
   * - config: AuthModuleConfig - 认证模块配置
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    const { jwt } = configService.getAppConfig();
    this.jwtSecret = jwt.secret;
    this.jwtExpiresIn = jwt.expiresIn;
  }

  /**
   * 创建 Token
   *
   * 功能描述：
   * - 根据载荷信息创建 JWT Token
   * - 支持自定义过期时间和密钥
   *
   * 参数说明：
   * - options: TokenPayload - Token 载荷信息
   *   - tokenId: string - Token ID
   *   - target: Target - 目标类型
   *   - targetId: string - 目标 ID
   *   - companyId?: string - 公司 ID（可选）
   * - expiresIn?: string - 过期时间（可选，默认使用配置值）
   * - secret?: string - 密钥（可选，默认使用配置值）
   *
   * 返回值说明：
   * - 包含 token、tokenId 和过期时间的对象
   */
  create(options: TokenPayload, expiresIn?: string, secret?: string) {
    secret = secret || this.jwtSecret;
    expiresIn = expiresIn || this.jwtExpiresIn;
    if (!options.tokenId) {
      options.tokenId = uuid();
    }
    const { tokenId, target, targetId, companyId } = options;
    const payload: JwtPayload = {
      jti: tokenId,
      aud: target,
      sub: targetId,
      cid: companyId,
    };
    const token = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
    const { value, unit } = TimeHandler().serialize(expiresIn);
    return {
      token,
      tokenId,
      expiredAt: DateHandler().add(value, unit).toDate(),
    };
  }

  /**
   * 验证 Token
   *
   * 功能描述：
   * - 验证 JWT Token 的有效性
   * - 支持自定义密钥
   *
   * 参数说明：
   * - token: string - JWT Token
   * - secret?: string - 密钥（可选，默认使用配置值）
   *
   * 返回值说明：
   * - 验证结果对象
   */
  verify(token: string, secret?: string): any {
    secret = secret || this.jwtSecret;
    return this.jwtService.verify(token, {
      secret,
    });
  }

  /**
   * 解析 Token
   *
   * 功能描述：
   * - 解析 JWT Token 获取载荷信息
   *
   * 参数说明：
   * - token: string - JWT Token
   *
   * 返回值说明：
   * - TokenPayload - Token 载荷信息
   */
  decode(token: string): TokenPayload {
    const payload = this.jwtService.decode(token);
    return {
      tokenId: payload.jti,
      target: payload.aud,
      targetId: payload.sub,
      companyId: payload.cid,
    };
  }

  /**
   * 序列化 JWT 载荷
   *
   * 功能描述：
   * - 将 JWT 载荷转换为 Token 载荷格式
   *
   * 参数说明：
   * - jwtPayload: JwtPayload - JWT 载荷
   *
   * 返回值说明：
   * - TokenPayload - Token 载荷信息
   */
  serialize(jwtPayload: JwtPayload): TokenPayload {
    return {
      tokenId: String(jwtPayload.jti),
      target: String(jwtPayload.aud) as Target,
      targetId: String(jwtPayload.sub),
      companyId: jwtPayload.cid,
    };
  }
}
