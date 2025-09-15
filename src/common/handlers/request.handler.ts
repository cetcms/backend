import { Request } from 'express';
import { RequestHeaders } from 'src/auth/interfaces';

export function RequestHandler(req: Request) {
  return {
    getIp() {
      return req.ip;
    },
    getUserAgent() {
      return req.header(RequestHeaders.UserAgent);
    },
    getFingerprint() {
      return req.header(RequestHeaders.Fingerprint);
    },
  };
}
