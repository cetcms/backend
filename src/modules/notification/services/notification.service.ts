import { Injectable } from '@nestjs/common';
import { CurrentAuth } from 'src/auth/decorators';
import { PaginationResult } from 'src/common/dto';
import {
  CreateOneNotificationArgs,
  FindManyNotificationArgs,
  NotificationPrivacy,
  NotificationReceiver,
  NotificationSender,
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
    const { admin, user, company } = auth;

    // 管理员接收消息
    if (admin && !company) {
      return this.notification.findMany({
        where: {
          OR: [
            {
              // 系统发送的消息
              sender: { equals: NotificationSender.System },
              receiver: { hasSome: [NotificationReceiver.Admin] },
              recipients: { some: { adminId: { equals: admin.id }, isRead: { equals: false } } },
            },
            {
              // 系统发送的公开消息
              sender: { equals: NotificationSender.System },
              privacy: { equals: NotificationPrivacy.Public },
              receiver: { hasSome: [NotificationReceiver.Admin] },
              recipients: { none: { adminId: { equals: admin.id } } },
            },
          ],
        },
      });
    }

    // 用户接收消息
    if (user && !company) {
      return this.notification.findMany({
        where: {
          OR: [
            {
              // 系统发送的消息
              sender: { equals: NotificationSender.System },
              receiver: { hasSome: [NotificationReceiver.User] },
              recipients: { some: { userId: { equals: user.id }, isRead: { equals: false } } },
            },
            {
              // 系统发送的公开消息
              sender: { equals: NotificationSender.System },
              privacy: { equals: NotificationPrivacy.Public },
              receiver: { hasSome: [NotificationReceiver.User] },
              recipients: { none: { userId: { equals: user.id } } },
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
              sender: { equals: NotificationSender.System },
              privacy: { equals: NotificationPrivacy.Public },
              receiver: { hasSome: [NotificationReceiver.Company] },
              recipients: { some: { companyId: { equals: company.id }, isRead: { equals: false } } },
            },
          ],
        },
      });
    }

    // 用户企业消息
    if (company && user) {
      return this.notification.findMany({
        where: {
          OR: [
            {
              // 系统发送给企业的公开消息
              sender: { equals: NotificationSender.System },
              privacy: { equals: NotificationPrivacy.Public },
              receiver: { hasSome: [NotificationReceiver.Company] },
              recipients: { some: { companyId: { equals: company.id }, isRead: { equals: false } } },
            },
            {
              // 系统发送给企业用户的私有消息
              sender: { equals: NotificationSender.System },
              privacy: { equals: NotificationPrivacy.Private },
              receiver: { hasSome: [NotificationReceiver.Company] },
              recipients: {
                some: { companyId: { equals: company.id }, userId: { equals: user.id }, isRead: { equals: false } },
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
