import { Injectable } from '@nestjs/common';
import { CurrentAuth } from 'src/auth/decorators';
import { PaginationResult } from 'src/common/dto';
import {
  CreateOneNotificationArgs,
  FindManyNotificationArgs,
  NotificationPrivacy,
  NotificationTarget,
  UpdateOneNotificationArgs,
} from 'src/generated/graphql';
import { NotificationRepository } from 'src/repositories';

@Injectable()
export class NotificationService {
  constructor(private readonly notification: NotificationRepository) {}

  async paginate(args: FindManyNotificationArgs) {
    if (!args.take) args.take = 10;
    if (!args.skip) args.skip = 0;
    const [notifications, totalCount] = await this.notification.findManyAndCount(args);
    return PaginationResult(notifications, args.take, args.skip, totalCount);
  }

  selfNotifications(auth: CurrentAuth) {
    const { admin, member, company } = auth;

    // 管理员接收消息
    if (admin && !company) {
      return this.notification.findMany({
        where: {
          OR: [
            {
              // 系统发送的消息
              sender: { equals: NotificationTarget.System },
              receiver: { hasSome: [NotificationTarget.Admin] },
              recipients: { some: { adminId: { equals: admin.id }, isRead: { equals: false } } },
            },
            {
              // 系统发送的公开消息
              sender: { equals: NotificationTarget.System },
              privacy: { equals: NotificationPrivacy.Public },
              receiver: { hasSome: [NotificationTarget.Admin] },
              recipients: { none: { adminId: { equals: admin.id } } },
            },
          ],
        },
      });
    }

    // 成员接收消息
    if (member && !company) {
      return this.notification.findMany({
        where: {
          OR: [
            {
              // 系统发送的消息
              sender: { equals: NotificationTarget.System },
              receiver: { hasSome: [NotificationTarget.Member] },
              recipients: { some: { memberId: { equals: member.id }, isRead: { equals: false } } },
            },
            {
              // 系统发送的公开消息
              sender: { equals: NotificationTarget.System },
              privacy: { equals: NotificationPrivacy.Public },
              receiver: { hasSome: [NotificationTarget.Member] },
              recipients: { none: { memberId: { equals: member.id } } },
            },
          ],
        },
      });
    }

    // 管理员企业消息
    if (company && admin) {
      return this.notification.findMany({
        where: {
          OR: [
            {
              // 系统发送的公开消息
              sender: { equals: NotificationTarget.System },
              privacy: { equals: NotificationPrivacy.Public },
              receiver: { hasSome: [NotificationTarget.Company] },
              recipients: { some: { companyId: { equals: company.id }, isRead: { equals: false } } },
            },
          ],
        },
      });
    }

    // 成员企业消息
    if (company && member) {
      return this.notification.findMany({
        where: {
          OR: [
            {
              // 系统发送给企业的公开消息
              sender: { equals: NotificationTarget.System },
              privacy: { equals: NotificationPrivacy.Public },
              receiver: { hasSome: [NotificationTarget.Company] },
              recipients: { some: { companyId: { equals: company.id }, isRead: { equals: false } } },
            },
            {
              // 系统发送给企业成员的私有消息
              sender: { equals: NotificationTarget.System },
              privacy: { equals: NotificationPrivacy.Private },
              receiver: { hasSome: [NotificationTarget.Company] },
              recipients: {
                some: { companyId: { equals: company.id }, memberId: { equals: member.id }, isRead: { equals: false } },
              },
            },
          ],
        },
      });
    }

    return [];
  }

  createOne(args: CreateOneNotificationArgs) {
    const { data } = args;
    return this.notification.create(data);
  }

  updateOne(args: UpdateOneNotificationArgs) {
    const { where, data } = args;
    return this.notification.update(where, data);
  }
}
