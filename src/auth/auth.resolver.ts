import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { CurrentAuth, CurrentRequestMeta } from 'src/auth/decorators';
import { Login, LoginInput } from 'src/auth/graphql';
import { JwtAuthGuard } from 'src/auth/guards';
import { Auth } from 'src/generated/graphql/auth';

@Resolver()
export class AuthResolver {
  constructor(private service: AuthService) {}

  @Mutation(() => Login)
  login(@Args('input') input: LoginInput, @CurrentRequestMeta() meta: CurrentRequestMeta) {
    return this.service.login(input, {
      fingerprint: meta.fingerprint,
      memberAgent: meta.memberAgent,
      ip: meta.ip,
      origin: meta.origin,
      frontendDomain: meta.frontendDomain,
    });
  }

  @Query(() => Login)
  refresh(@CurrentAuth() auth: CurrentAuth, @CurrentRequestMeta() meta: CurrentRequestMeta) {
    return this.service.refresh(auth, meta);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  logout(@CurrentAuth() auth: CurrentAuth) {
    return this.service.logout(auth);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Auth)
  authInfo(@CurrentAuth() auth: CurrentAuth) {
    return auth;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Login)
  switchAuthCompany(
    @CurrentAuth() auth: CurrentAuth,
    @CurrentRequestMeta() meta: CurrentRequestMeta,
    @Args('companyId', { nullable: true }) companyId?: string
  ) {
    return this.service.switchCompany(auth, meta, companyId);
  }
}
