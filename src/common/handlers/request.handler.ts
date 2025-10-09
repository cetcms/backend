import { ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { getClientIp } from 'get-client-ip';
import { AppConfig } from 'src/config';
import { RequestHeaders } from 'src/contracts';
import { Auth, RequestMethod } from 'src/generated/graphql';

/**
 * 请求处理器函数
 * 提供对 Express 请求对象的封装，方便获取请求相关信息
 * @param req - Express 请求对象
 * @returns 包含各种请求信息获取方法的对象
 */
export function RequestHandler(req: Request) {
  return {
    /**
     * 获取客户端IP地址
     * @returns 客户端IP地址，如果无法获取则返回null
     */
    getIp() {
      return req.res ? getClientIp(req) || null : null;
    },

    /**
     * 获取HTTP请求方法
     * @returns HTTP请求方法（GET、POST等）
     */
    getMethod() {
      return req.method as RequestMethod;
    },

    /**
     * 获取请求路由路径
     * @returns 请求的基础URL路径，如果不存在则返回null
     */
    getRoute() {
      return req.baseUrl || null;
    },

    /**
     * 获取查询参数
     * @returns URL中的查询参数对象
     */
    getQuery() {
      return req.query as any;
    },

    /**
     * 获取请求体数据
     * @returns 请求体内容，如果不存在则返回null
     */
    getBody() {
      return req.body || null;
    },

    /**
     * 获取路径参数
     * @returns 路径参数对象
     */
    getParams() {
      return req.params as any;
    },

    /**
     * 获取请求头信息
     * @returns 包含所有请求头的键值对对象
     */
    getHeaders() {
      return req.headers;
    },

    /**
     * 获取请求语言设置
     * @returns 客户端请求的语言，如果未设置则默认返回'en'
     */
    getLanguage() {
      return req.header?.(RequestHeaders.Language.toLowerCase()) || 'en';
    },

    /**
     * 获取用户代理信息
     * @returns 用户代理字符串，如果不存在则返回null
     */
    getUserAgent() {
      return req.header?.(RequestHeaders.UserAgent.toLowerCase()) || null;
    },

    /**
     * 获取设备指纹信息
     * @returns 设备指纹字符串，如果不存在则返回null
     */
    getFingerprint() {
      // 获取设备指纹
      const fingerprint = req.header?.(RequestHeaders.Fingerprint.toLowerCase());
      if (AppConfig.auth.enableFingerprint && !fingerprint) {
        throw new ForbiddenException(`${RequestHeaders.Fingerprint} must be present in the header`);
      }
      return fingerprint || null;
    },

    /**
     * 获取认证信息
     * @returns 认证信息对象，如果不存在则返回null
     */
    getAuthInfo() {
      if (!req.authInfo) {
        return null;
      }
      return req.authInfo as Auth;
    },

    /**
     * 获取设备信息
     * @returns 包含用户代理信息的设备对象
     */
    getDevice() {
      return {
        userAgent: this.getUserAgent(),
      };
    },

    /**
     * 获取位置信息
     * @returns 包含IP地址的位置信息对象
     */
    getLocation() {
      return {
        ip: this.getIp(),
      };
    },
  };
}
