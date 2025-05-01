import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { userEventTypes } from './common/enums';
import { UserPayload } from './common/interfaces';

@Controller()
export class NotificationServiceController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern({cmd: userEventTypes.USER_CREATED})
  onUserCreated(@Payload() data: UserPayload, @Ctx() context: RmqContext) {
    this.notificationService.onUserCreated(data);
    this.ack(context);
    return true
  } 

  @MessagePattern({cmd: userEventTypes.USER_DELETED})
  onUserDeleted(@Payload() data: UserPayload, @Ctx() context: RmqContext) {
    this.notificationService.onUserDeleted(data);
    this.ack(context);
    return true 
  } 

  ack(context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();
    channel.ack(originalMessage);
  }
}
