import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { CurrentAuth, ApiCommon } from 'src/auth/decorators';
import { GetAuthInfoResult } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('auth')
export class AuthController {
  @Get()
  @ApiCommon()
  @ApiOkResponse({
    type: GetAuthInfoResult,
  })
  @UseGuards(JwtAuthGuard)
  getAuthInfo(@CurrentAuth() auth: CurrentAuth) {
    return auth;
  }
}
