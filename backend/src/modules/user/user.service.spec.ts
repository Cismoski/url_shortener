import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { CreateUserPayload } from './payload/create-user.payload';
import * as bcrypt from 'bcrypt';

// Mock bcrypt to avoid actual hashing during tests
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserPayload = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
    };

    const mockUser = {
      id: BigInt(1),
      email: 'test@example.com',
      password: 'hashed_password',
      fullName: 'Test User',
      userKey: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new user successfully', async () => {
      // Mock the prisma service to return null for findUnique (user doesn't exist)
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      // Mock the prisma service to return a user for create
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      // Verify that findUnique was called with the correct email
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });

      // Verify that hash was called with the correct password
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);

      // Verify that create was called with the correct data
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          password: 'hashed_password', // The mocked hash value
          fullName: createUserDto.fullName,
        },
      });

      // Verify the returned user data
      expect(result).toEqual({
        id: mockUser.userKey,
        email: mockUser.email,
        full_name: mockUser.fullName,
      });
    });

    it('should throw BadRequestException if email is already in use', async () => {
      // Mock the prisma service to return a user for findUnique (user exists)
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Expect the service to throw a BadRequestException
      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email already in use',
      );

      // Verify that findUnique was called with the correct email
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });

      // Verify that create was not called
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    const email = 'test@example.com';
    const mockUser = {
      id: BigInt(1),
      email: 'test@example.com',
      password: 'hashed_password',
      fullName: 'Test User',
      userKey: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should find a user by email successfully', async () => {
      // Mock the prisma service to return a user for findUnique
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      // Verify that findUnique was called with the correct email
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });

      // Verify the returned user data
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user is not found', async () => {
      // Mock the prisma service to return null for findUnique (user doesn't exist)
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Expect the service to throw a BadRequestException
      await expect(service.findByEmail(email)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findByEmail(email)).rejects.toThrow('User not found');

      // Verify that findUnique was called with the correct email
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });
});
