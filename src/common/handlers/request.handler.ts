import { Request } from 'express';
import { getClientIp } from 'get-client-ip';
import { RequestHeaders } from 'src/auth/interfaces';
import { Auth, RequestMethod } from 'src/generated/graphql';

export function RequestHandler(req: Request) {
  return {
    getIp() {
      return getClientIp(req) || null;
    },
    getMethod() {
      return req.method as RequestMethod;
    },
    getRoute() {
      return req.baseUrl || null;
    },
    getQuery() {
      return req.query as any;
    },
    getBody() {
      return req.body || null;
    },
    getParams() {
      return req.params as any;
    },
    getHeaders() {
      return req.headers;
    },
    getLanguage() {
      return req.header(RequestHeaders.Language) || null;
    },
    getUserAgent() {
      return req.header(RequestHeaders.UserAgent) || null;
    },
    getFingerprint() {
      return req.header(RequestHeaders.Fingerprint) || null;
    },
    getAuthInfo() {
      if (!req.authInfo) {
        return null;
      }
      return req.authInfo as Auth;
    },
    getDevice() {
      return {
        userAgent: this.getUserAgent(),
      };
    },
    getLocation() {
      return {
        ip: this.getIp(),
      };
    },
  };
}
