import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserPayload } from './payload/create-user.payload';
import { hash } from 'bcrypt';
import { UserDetailDto } from './dto/user.dto';
import { User } from 'generated/prisma';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserPayload): Promise<UserDetailDto> {
    const { email, password, fullName } = createUserDto;

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
      },
    });

    return {
      id: user.userKey,
      email: user.email,
      full_name: user.fullName,
    };
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user == null) {
      throw new BadRequestException('User not found');
    }

    return user;
  }
}
