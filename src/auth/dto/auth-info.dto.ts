import { ApiProperty } from '@nestjs/swagger';
import {
  AdminEntity,
  AdminRoleEntity,
  AuthEntity,
  CompanyEntity,
  CompanyRoleEntity,
  UserEntity,
} from 'src/generated/dto';

class AuthInfoAdmin extends AdminEntity {
  @ApiProperty({
    type: AdminRoleEntity,
  })
  role: AdminRoleEntity;
}

class AuthInfoUser extends UserEntity {
  @ApiProperty({
    type: String,
  })
  roleId: string;
  @ApiProperty({
    type: CompanyRoleEntity,
  })
  role: CompanyRoleEntity;
}

export class GetAuthInfoResult extends AuthEntity {
  @ApiProperty({
    type: [String],
  })
  permissions: string[];

  @ApiProperty({
    type: AuthInfoAdmin,
    nullable: true,
  })
  admin?: AuthInfoAdmin;

  @ApiProperty({
    type: AuthInfoUser,
    nullable: true,
  })
  user?: AuthInfoUser;

  @ApiProperty({
    type: CompanyEntity,
    nullable: true,
  })
  company?: CompanyEntity;
}
