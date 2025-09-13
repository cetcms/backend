import { Query, Mutation, Resolver, Args } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { Login, LoginInput } from 'src/auth/dto';

@Resolver()
export class AuthResolver {
  constructor(private service: AuthService) {}

  @Mutation(() => Login)
  login(@Args('input') input: LoginInput) {
    return this.service.login(input);
  }

  @Query(() => Boolean)
  logout() {
    return this.service.logout();
  }
}
