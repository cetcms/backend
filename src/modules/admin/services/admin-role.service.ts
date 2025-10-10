import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CurrentAuth } from 'src/auth/decorators';
import { PermissionInfo, PermissionItem } from 'src/auth/graphql';
import { PaginationResult } from 'src/common/dto';
import { SystemContract } from 'src/contracts';
import {
  AdminRoleWhereUniqueInput,
  CreateOneAdminRoleArgs,
  FindManyAdminRoleArgs,
  FindUniqueAdminRoleArgs,
  Target,
  UpdateOneAdminRoleArgs,
} from 'src/generated/graphql';
import { Permissions } from 'src/generated/permissions';
import { AdminRoleRepository } from 'src/repositories';

@Injectable()
export class AdminRoleService {
  constructor(private readonly adminRole: AdminRoleRepository) {}

  async findOneByUnique(args: FindUniqueAdminRoleArgs) {
    const { where } = args;
    const adminRole = await this.adminRole.findUnique(where);
    if (adminRole) {
      return adminRole;
    }
    throw new NotFoundException('管理员角色不存在');
  }

  async paginate(args: FindManyAdminRoleArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [adminRoles, totalCount] = await this.adminRole.findManyAndCount(args);
    return PaginationResult(adminRoles, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneAdminRoleArgs) {
    const { data } = args;
    return this.adminRole.create(data);
  }

  updateOne(args: UpdateOneAdminRoleArgs) {
    const { where, data } = args;
    return this.adminRole.update(where, data);
  }

  async permissionInfo(auth: CurrentAuth, where?: AdminRoleWhereUniqueInput) {
    const items: PermissionItem[] = [];
    const allowSelect: string[] = [];
    const allowUnselect: string[] = [];
    const currentPermissions = auth.permissions || [];
    const currentRole = auth.adminRole;
    if (!currentRole) {
      throw new ForbiddenException();
    }

    const isEdit = Boolean(Object.values(where || {}).length);
    const editRole = isEdit ? await this.findOneByUnique({ where: where as FindUniqueAdminRoleArgs['where'] }) : null;

    Permissions.forEach((p) => {
      const allow = !p.targets.length || p.targets.includes(Target.Admin);
      const resource = `${p.subject}:${p.action}`;
      const isSelfResource = currentPermissions.includes(resource);
      const isEditResource = Boolean(editRole && editRole.permissions?.includes(resource));
      p.targets = [];
      // 过滤掉不允许的项
      if (!allow) return;
      // 角色可操作的项
      if (currentRole?.code === SystemContract.RootAdminRole) {
        // 根管理员允许对所有权限的操作
        items.push(p);
        // 修改本角色
        if (currentRole.code === editRole?.code) {
          allowSelect.push(resource);
        }
        // 添加角色
        if (!editRole) {
          allowSelect.push(resource);
          allowUnselect.push(resource);
        }
      } else if (isSelfResource || isEditResource) {
        // 非根管理员只允许已有权限的操作
        items.push(p);
        // 修改其他角色
        if (
          editRole &&
          isSelfResource &&
          currentRole.id !== editRole.id &&
          editRole.code !== SystemContract.RootAdminRole
        ) {
          allowSelect.push(resource);
          allowUnselect.push(resource);
        }

        // 添加角色
        if (!editRole) {
          allowSelect.push(resource);
          allowUnselect.push(resource);
        }
      }
    });

    const result: PermissionInfo = {
      items,
      allowSelect,
      allowUnselect,
    };

    return result;
  }
}
