import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CurrentAuth } from 'src/auth/decorators';
import { PermissionGroup, PermissionInfo, PermissionItem } from 'src/auth/graphql';
import { PaginationResult } from 'src/common/dto';
import { PermissionGroupHandler } from 'src/common/handlers';
import { SystemContract } from 'src/contracts';
import {
  CompanyRoleWhereUniqueInput,
  CreateOneCompanyRoleArgs,
  FindManyCompanyRoleArgs,
  FindUniqueCompanyRoleArgs,
  Target,
  UpdateOneCompanyRoleArgs,
} from 'src/generated/graphql';
import { Permissions } from 'src/generated/permissions';
import { I18nService } from 'src/i18n';
import { AdminRoleRepository, CompanyRoleRepository } from 'src/repositories';

@Injectable()
export class CompanyRoleService {
  constructor(
    private readonly companyRole: CompanyRoleRepository,
    private readonly adminRole: AdminRoleRepository,
    private readonly i18n: I18nService
  ) {}

  async findOneByUnique(args: FindUniqueCompanyRoleArgs) {
    const { where } = args;
    const companyRole = await this.companyRole.findUnique(where);
    if (companyRole) {
      return companyRole;
    }
    throw new NotFoundException('企业角色不存在');
  }

  async paginate(args: FindManyCompanyRoleArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [companyRoles, totalCount] = await this.companyRole.findManyAndCount(args);
    return PaginationResult(companyRoles, args.take, args.skip, totalCount);
  }

  createOne(args: CreateOneCompanyRoleArgs) {
    const { data } = args;
    return this.companyRole.create(data);
  }

  updateOne(args: UpdateOneCompanyRoleArgs) {
    const { where, data } = args;
    return this.companyRole.update(where, data);
  }

  async permissionInfo(auth: CurrentAuth, where?: CompanyRoleWhereUniqueInput) {
    const items: PermissionItem[] = [];
    const allowSelect: string[] = [];
    const allowUnselect: string[] = [];
    const currentPermissions = auth.permissions || [];
    const currentAdminRole = auth.adminRole;
    const currentCompanyRole = auth.companyRole;

    if (!currentAdminRole && !currentCompanyRole) {
      throw new ForbiddenException();
    }

    const isEdit = Boolean(Object.values(where || {}).length);
    const editRole = isEdit ? await this.findOneByUnique({ where: where as FindUniqueCompanyRoleArgs['where'] }) : null;

    Permissions.forEach((p) => {
      const allow = !p.targets.length || p.targets.includes(Target.Member);
      const resource = p.name;
      const isSelfResource = currentPermissions.includes(resource);
      const isEditResource = Boolean(editRole && editRole.permissions?.includes(resource));
      p.targets = [];
      // 过滤掉不允许的项
      if (!allow) return;
      // 角色可操作的项
      if (
        currentAdminRole?.code === SystemContract.RootAdminRole ||
        currentCompanyRole?.code === SystemContract.RootCompanyRole
      ) {
        // 根管理员或根企业角色允许对所有权限的操作
        items.push(p);
        // 修改本角色
        if (currentCompanyRole && currentCompanyRole.code === editRole?.code) {
          allowSelect.push(resource);
        }
        // 添加角色或修改角色（根管理员可以操作所有权限）
        if (!editRole || currentAdminRole?.code === SystemContract.RootAdminRole) {
          allowSelect.push(resource);
          allowUnselect.push(resource);
        }
      } else if (isSelfResource || isEditResource) {
        // 非根角色只允许已有权限的操作
        items.push(p);
        // 修改其他角色
        if (
          editRole &&
          currentCompanyRole &&
          isSelfResource &&
          currentCompanyRole.id !== editRole.id &&
          editRole.code !== SystemContract.RootCompanyRole
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
      alias: [],
    };

    return result;
  }

  async permissionGroupInfo(auth: CurrentAuth, where?: CompanyRoleWhereUniqueInput) {
    const { items, allowSelect, allowUnselect, alias } = await this.permissionInfo(auth, where);
    const groups = await PermissionGroupHandler(items, this.i18n);
    const result: PermissionGroup = {
      groups,
      allowSelect,
      allowUnselect,
      alias,
    };
    return result;
  }
}
