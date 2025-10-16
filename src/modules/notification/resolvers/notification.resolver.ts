import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentAuth, UsePermission } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { IPaginated, Paginated } from 'src/common/dto';
import { Notification, FindManyNotificationArgs } from 'src/generated/graphql';

import { NotificationService } from '../services';

const PaginatedNotification = Paginated(Notification);

/**
 * 消息通知管理
 * @group Notification
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class NotificationResolver {
  constructor(private readonly service: NotificationService) {}

  /**
   * 分页查询消息通知
   * @param args
   */
  @UsePermission()
  @Query(() => PaginatedNotification)
  paginateNotifications(@Args() args: FindManyNotificationArgs): Promise<IPaginated<Notification>> {
    return this.service.paginate(args);
  }

  /**
   * 获取当前成员消息通知
   */
  @UsePermission()
  @Query(() => [Notification])
  listSelfNotifications(@CurrentAuth() auth: CurrentAuth) {
    return this.service.selfNotifications(auth);
  }
}
