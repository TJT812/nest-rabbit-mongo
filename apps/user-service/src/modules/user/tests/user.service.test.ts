import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../../src/modules/user/user.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClientProxy } from '@nestjs/microservices';
import { Logger, BadRequestException } from '@nestjs/common';
import { userModelName } from '../../../../src/db/schemas/user.schema';
import { servicesEnum, userEventTypes } from '../../../../src/common/enums';
import { UserAttributes } from '../../../../src/common/interfaces';
import {
  CreateUserDto,
} from '../../../../src/modules/user/dto/user.dto';
import { of } from 'rxjs';
import { utils } from '../../../../src/common/utils';

// Mock the utils module
jest.mock('../src/common/utils', () => ({
  utils: {
    normalizeEmail: jest.fn((email) => email.toLowerCase()),
    observe: jest.fn(
      (observable) => new Promise((resolve) => observable.subscribe(resolve)),
    ),
  },
}));

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<UserAttributes>;
  let notificationService: ClientProxy;
  let logger: Logger;

  // Sample data for tests
  const userId = new Types.ObjectId();
  const mockUser = {
    _id: userId,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  // Mock implementations
  const userModelMock = {
    insertOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    exists: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
  };

  const notificationServiceMock = {
    send: jest.fn().mockReturnValue(of(true)),
  };

  const loggerMock = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(userModelName),
          useValue: userModelMock,
        },
        {
          provide: servicesEnum.NOTIFICATION_SERVICE,
          useValue: notificationServiceMock,
        },
        {
          provide: Logger,
          useValue: loggerMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<UserAttributes>>(getModelToken(userModelName));
    notificationService = module.get<ClientProxy>(
      servicesEnum.NOTIFICATION_SERVICE,
    );
    logger = module.get<Logger>(Logger);
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      name: 'Test User',
      email: 'TEST@example.com',
    };

    const normalizedEmail = 'test@example.com';

    it('should create a user successfully', async () => {
      // Setup mocks
      userModelMock.exists.mockResolvedValue(null);
      userModelMock.insertOne.mockResolvedValue(mockUser);

      // Call the method
      const result = await service.create(createDto);

      // Assertions
      expect(utils.normalizeEmail).toHaveBeenCalledWith(createDto.email);
      expect(userModelMock.exists).toHaveBeenCalledWith({
        email: normalizedEmail,
      });
      expect(userModelMock.insertOne).toHaveBeenCalledWith({
        name: createDto.name,
        email: normalizedEmail,
      });
      expect(notificationServiceMock.send).toHaveBeenCalledWith(
        { cmd: userEventTypes.USER_CREATED },
        { name: createDto.name, email: normalizedEmail },
      );
      expect(loggerMock.log).toHaveBeenCalledWith(
        'Message sent to notification service',
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user with email already exists', async () => {
      // Setup mocks
      userModelMock.exists.mockResolvedValue({ _id: new Types.ObjectId() });

      // Test and assertions
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userModelMock.insertOne).not.toHaveBeenCalled();
      expect(notificationServiceMock.send).not.toHaveBeenCalled();
    });

    it('should delete user if notification service throws error', async () => {
      // Setup mocks
      userModelMock.exists.mockResolvedValue(null);
      userModelMock.insertOne.mockResolvedValue(mockUser);

      // Setup error scenario
      const error = new Error('Notification error');
      jest.spyOn(utils, 'observe').mockRejectedValueOnce(error);

      // Test and assertions
      await expect(service.create(createDto)).rejects.toThrow(error);
      expect(userModelMock.findByIdAndDelete).toHaveBeenCalledWith(
        mockUser._id,
      );
      expect(loggerMock.error).toHaveBeenCalledWith(
        'Error while sending message to notification service',
        error,
      );
    });
  });
});
