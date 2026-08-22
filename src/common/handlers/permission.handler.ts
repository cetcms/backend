import * as crypto from 'crypto';

import voca from 'voca';

import { PermissionGroupItem, PermissionItem } from 'src/auth/graphql';
import { I18nService } from 'src/i18n';

const md5 = (value: string): string => {
  return crypto.createHash('md5').update(value).digest('hex');
};

export const PermissionAliasHandler = (subject: string, action: string): { name: string; value: string } => {
  let name = '';
  const value = `${subject}:${action}`;
  if (subject.indexOf('Controller') >= 0) {
    name = `${subject.replace('Controller', '')}_${action}`;
  }
  if (subject.indexOf('Resolver') >= 0) {
    name = action;
  }
  return { name: voca.capitalize(voca.camelCase(name)), value };
};

/**
 * 将 permissions 转换为嵌套树结构，按照 group > subject > action 层级
 * @param permissions 权限列表
 * @param i18n
 * @returns 嵌套树结构
 */
export const PermissionGroupHandler = async (permissions: PermissionItem[], i18n: I18nService) => {
  const groupMap: Record<string, PermissionGroupItem> = {};
  const subjectMap: Record<string, PermissionGroupItem> = {};
  const { t } = await i18n.useTranslation('permissions');

  // 先收集所有唯一的模块
  permissions.forEach((permission) => {
    const groupId = md5(permission.group);
    if (!groupMap[permission.group]) {
      groupMap[permission.group] = {
        id: groupId,
        name: groupId,
        label: t(`group.${permission.group}`),
        items: [],
      };
    }
  });

  // 收集所有唯一的主题，并关联到对应模块
  permissions.forEach((permission) => {
    const subjectId = md5(`${permission.group}-${permission.subject}`);
    if (!subjectMap[subjectId]) {
      subjectMap[subjectId] = {
        id: subjectId,
        name: subjectId,
        label: t(`subject.${permission.subject}`),
        items: [],
      };

      // 将主题添加到对应模块的子节点中
      groupMap[permission.group].items!.push(subjectMap[subjectId]);
    }
  });

  // 添加操作到对应的主体下
  permissions.forEach((permission) => {
    const subjectId = md5(`${permission.group}-${permission.subject}`);
    const actionId = md5(`${permission.group}-${permission.subject}-${permission.action}`);
    const actionNode: PermissionGroupItem = {
      id: actionId,
      name: permission.name,
      label: t(`action.${permission.subject}.${permission.action}`),
      items: [],
    };

    subjectMap[subjectId].items!.push(actionNode);
  });

  // 返回模块数组作为根节点
  return Object.values(groupMap);
};
