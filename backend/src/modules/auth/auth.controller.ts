import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginPayload } from './payload/login.payload';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      properties: {
        access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            email: { type: 'string', example: 'user@example.com' },
            fullName: { type: 'string', example: 'John Doe' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @Post('login')
  login(@Body() loginDto: LoginPayload) {
    return this.authService.login(loginDto);
  }
}
