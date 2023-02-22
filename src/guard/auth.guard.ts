import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/entites/user.entity';
import { Repository } from 'typeorm';

type Role = undefined;

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const roles =
      this.reflector.get<Role[]>('roles', context.getClass()) ||
      this.reflector.get<Role[]>('roles', context.getHandler());
    return this.validateRequest(roles, request);
  }

  private async validateRequest(roles: Role[], request: Request) {
    const JWTString = request.headers?.authorization?.split('Bearer ')[1];
    const { userId, type } = this.authService.verify(JWTString);
    request.token = {
      type: type,
      userId: userId,
    };

    if (type !== 'user') return false;
    const user = await this.usersRepository.findOne({
      where: {
        id: +userId,
      },
    });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');
    request.user = user;

    return true;
  }
}
