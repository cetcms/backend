import { UseGuards } from '@nestjs/common';
import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { CurrentAuth, CurrentRequestMeta } from 'src/auth/decorators';
import { Login, LoginInput } from 'src/auth/graphql';
import { JwtAuthGuard } from 'src/auth/guards';
import { Company } from 'src/generated/graphql';
import { Auth } from 'src/generated/graphql/auth';

@Resolver()
export class AuthResolver {
  constructor(private service: AuthService) {}

  @Mutation(() => Login)
  login(@Args('input') input: LoginInput, @CurrentRequestMeta() meta: CurrentRequestMeta) {
    return this.service.login(input, {
      fingerprint: meta.fingerprint,
      userAgent: meta.userAgent,
      ip: meta.ip,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Boolean)
  logout(@CurrentAuth() auth: Auth) {
    return this.service.logout(auth);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Auth)
  authInfo(@CurrentAuth() auth: Auth) {
    return auth;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Login)
  switchAuthCompany(
    @CurrentAuth() auth: Auth,
    @CurrentRequestMeta() meta: CurrentRequestMeta,
    @Args('companyId') companyId: string
  ) {
    return this.service.switchCompany(auth, meta, companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Company], { nullable: true })
  listAuthCompanies(@CurrentAuth() auth: Auth, @Args('name') name: string) {
    return this.service.listCompanies(auth, name);
  }
}
