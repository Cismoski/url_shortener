import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserPayload } from './payload/create-user.payload';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('api/users/register')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserPayload })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    schema: {
      properties: {
        id: { type: 'string', example: '1' },
        email: { type: 'string', example: 'user@example.com' },
        fullName: { type: 'string', example: 'John Doe' },
        userKey: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @Post()
  create(@Body() createUserDto: CreateUserPayload) {
    return this.userService.create(createUserDto);
  }
}
