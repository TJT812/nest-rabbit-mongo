import { Test, TestingModule } from '@nestjs/testing';
import { NotificationServiceController } from './notification.controller';
import { NotificationService } from './notification.service';

describe('NotificationServiceController', () => {
  let notificationServiceController: NotificationServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NotificationServiceController],
      providers: [NotificationService],
    }).compile();

    notificationServiceController = app.get<NotificationServiceController>(NotificationServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
    });
  });
});
