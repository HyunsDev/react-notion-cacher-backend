import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Auth } from 'src/decorator/auth.decorator';
import { User } from 'src/decorator/user.decorator';
import { UserEntity } from 'src/entites/user.entity';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() dto: SignUpDto) {
    return await this.authService.createAccount(
      dto.email,
      dto.password,
      dto.adminToken,
    );
  }

  @Post('signin')
  async signIn(@Body() dto: SignInDto) {
    return await this.authService.signIn(dto.email, dto.password);
  }

  @Delete('account')
  @Auth()
  async deleteAccount(@User() user: UserEntity) {
    return await this.authService.deleteAccount(user);
  }
}
