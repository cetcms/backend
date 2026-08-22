import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

import { Notification } from 'src/generated/graphql';
import { NotificationRepository } from 'src/repositories';

@Resolver(Notification)
export class NotificationExtend {
  constructor(private readonly notification: NotificationRepository) {}

  @ResolveField(() => Boolean, { nullable: true })
  isRead(@Parent() notification: Notification) {
    if (!notification.recipients) return undefined;
  }
}
