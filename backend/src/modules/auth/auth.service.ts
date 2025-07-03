import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginPayload } from './payload/login.payload';
import { compare } from 'bcrypt';
import { User } from 'generated/prisma';
import { LoginResponseDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);

    if (user == null) {
      return null;
    }

    const passwordMatches = await compare(password, user.password);
    if (passwordMatches) {
      return user;
    }

    return null;
  }

  async login(loginPayload: LoginPayload): Promise<LoginResponseDto> {
    const { email, password } = loginPayload;
    const user = await this.validateUser(email, password);

    if (user == null) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id.toString() };
    const response = {
      id: user.userKey,
      email: user.email,
      full_name: user.fullName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      response,
    };
  }
}
