import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenFactory } from 'src/auth/factories';
import { JwtStrategy } from 'src/auth/strategies';
import { ConfigService } from 'src/config';

import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.getAppConfig().jwt.secret,
        signOptions: { expiresIn: configService.getAppConfig().jwt.expiresIn },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, AuthResolver, TokenFactory, JwtStrategy],
})
export class AuthModule {}
