import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { CurrentAuth, ApiCommon } from 'src/auth/decorators';
import { GetAuthInfoResult } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards';
import { Auth } from 'src/generated/graphql';

@Controller('auth')
export class AuthController {
  @Get()
  @ApiCommon()
  @ApiOkResponse({
    type: GetAuthInfoResult,
  })
  @UseGuards(JwtAuthGuard)
  getAuthInfo(@CurrentAuth() auth: Auth) {
    return auth;
  }
}
