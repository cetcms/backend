import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { CurrentAuth, CurrentRequestInfo } from 'src/auth/decorators';
import { Login, LoginInput } from 'src/auth/dto';
import { JwtAuthGuard } from 'src/auth/guards';
import { Auth } from 'src/generated/graphql/auth';

@Resolver()
export class AuthResolver {
  constructor(private service: AuthService) {}

  @Mutation(() => Login)
  login(@Args('input') input: LoginInput, @CurrentRequestInfo() info: CurrentRequestInfo) {
    return this.service.login(input, {
      fingerprint: info.fingerprint,
      userAgent: info.userAgent,
      ip: info.ip,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  logout(@CurrentAuth() auth: Auth) {
    return this.service.logout(auth);
  }
}
