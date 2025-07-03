import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginPayload } from './payload/login.payload';
import { compare } from 'bcrypt';

// Mock bcrypt to avoid actual comparison during tests
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockUser = {
      id: BigInt(1),
      email: 'test@example.com',
      password: 'hashed_password',
      fullName: 'Test User',
      userKey: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a user if credentials are valid', async () => {
      // Mock the userService to return a user
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      // Mock bcrypt to return true (password matches)
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      // Verify that findByEmail was called with the correct email
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      // Verify that compare was called with the correct password
      expect(compare).toHaveBeenCalledWith(password, mockUser.password);
      // Verify the returned user
      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      // Mock the userService to throw an exception (user not found)
      mockUserService.findByEmail.mockImplementationOnce(() => {
        throw new BadRequestException('User not found');
      });

      await expect(service.validateUser(email, password)).rejects.toThrow(BadRequestException);

      // Verify that findByEmail was called with the correct email
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      // Verify that compare was not called
      expect(compare).not.toHaveBeenCalled();
    });

    it('should return null if password does not match', async () => {
      // Mock the userService to return a user
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      // Mock bcrypt to return false (password does not match)
      (compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(email, password);

      // Verify that findByEmail was called with the correct email
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      // Verify that compare was called with the correct password
      expect(compare).toHaveBeenCalledWith(password, mockUser.password);
      // Verify that null is returned
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'password123',
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

    it('should return access token and user data if login is successful', async () => {
      // Mock validateUser to return a user
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);

      const result = await service.login(loginPayload);

      // Verify that validateUser was called with the correct credentials
      expect(service.validateUser).toHaveBeenCalledWith(loginPayload.email, loginPayload.password);

      // Verify that sign was called with the correct payload
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id.toString(),
      });

      // Verify the returned data
      expect(result).toEqual({
        access_token: 'test_token',
        response: {
          id: mockUser.userKey,
          email: mockUser.email,
          full_name: mockUser.fullName,
        },
      });
    });

    it('should throw UnauthorizedException if login fails', async () => {
      // Mock validateUser to return null
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      // Expect the service to throw an UnauthorizedException
      await expect(service.login(loginPayload)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginPayload)).rejects.toThrow('Invalid credentials');

      // Verify that validateUser was called with the correct credentials
      expect(service.validateUser).toHaveBeenCalledWith(loginPayload.email, loginPayload.password);

      // Verify that sign was not called
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
