import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { RequestHeaders } from 'src/auth/interfaces';

export function ApiCommon({ auth }: { auth?: boolean } = { auth: true }) {
  const headers = [
    ApiHeader({
      name: RequestHeaders.Fingerprint,
      description: '客户端请求指纹',
    }),
    ApiHeader({
      name: RequestHeaders.Language,
      description: '客户端语言标识',
    }),
  ];
  if (auth) {
    headers.push(ApiBearerAuth());
  }
  return applyDecorators(...headers);
}
