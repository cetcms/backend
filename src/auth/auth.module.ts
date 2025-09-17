import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TokenFactory } from 'src/auth/factories';
import { JwtStrategy } from 'src/auth/strategies';
import { ConfigService } from 'src/config';

import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getAppConfig().jwt.secret,
        signOptions: { expiresIn: configService.getAppConfig().jwt.expiresIn },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, TokenFactory, JwtStrategy, AuthResolver],
  exports: [PassportModule, JwtModule],
  controllers: [AuthController],
})
export class AuthModule {}
