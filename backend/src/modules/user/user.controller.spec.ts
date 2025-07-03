import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserPayload } from './payload/create-user.payload';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserPayload = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    const mockUserResponse = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      full_name: 'Test User',
    };

    it('should create a new user successfully', async () => {
      // Mock the userService to return a user
      mockUserService.create.mockResolvedValue(mockUserResponse);

      const result = await controller.create(createUserDto);

      // Verify that create was called with the correct data
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);

      // Verify the returned user data
      expect(result).toEqual(mockUserResponse);
    });

    it('should pass through exceptions from the service', async () => {
      // Mock the userService to throw an exception
      mockUserService.create.mockRejectedValue(
        new BadRequestException('Email already in use'),
      );

      // Expect the controller to throw the same exception
      await expect(controller.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Email already in use',
      );

      // Verify that create was called with the correct data
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });
});
