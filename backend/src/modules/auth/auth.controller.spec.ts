import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginPayload } from './payload/login.payload';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginPayload: LoginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockLoginResponse = {
      access_token: 'test_token',
      response: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        full_name: 'Test User',
      },
    };

    it('should return login response if login is successful', async () => {
      // Mock the authService to return a login response
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginPayload);

      // Verify that login was called with the correct payload
      expect(authService.login).toHaveBeenCalledWith(loginPayload);

      // Verify the returned data
      expect(result).toEqual(mockLoginResponse);
    });

    it('should pass through exceptions from the service', async () => {
      // Mock the authService to throw an exception
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      // Expect the controller to throw the same exception
      await expect(controller.login(loginPayload)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(loginPayload)).rejects.toThrow('Invalid credentials');

      // Verify that login was called with the correct payload
      expect(authService.login).toHaveBeenCalledWith(loginPayload);
    });
  });
});
