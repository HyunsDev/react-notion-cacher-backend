import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entites/user.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  public async createAccount(
    email: string,
    password: string,
    adminToken: string,
  ) {
    const alreadyUser = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (alreadyUser) {
      throw new BadRequestException({
        code: 'ALREADY_USER_EXIST',
        message: '이미 사용중인 아이디입니다.',
      });
    }

    if (adminToken !== process.env.ADMIN_TOKEN) {
      throw new BadRequestException({
        code: 'WRONG_ADMIN_TOKEN',
        message: '잘못된 메세지 토큰입니다.',
      });
    }

    const passwordSalt = crypto.randomBytes(64).toString('base64');
    const hashedPassword = crypto
      .pbkdf2Sync(password, passwordSalt, 8, 64, 'sha512')
      .toString('base64');

    const user = new UserEntity();
    user.email = email;
    user.password = hashedPassword;
    user.passwordSalt = passwordSalt;
    await this.userRepository.save(user);
    return;
  }

  public async signIn(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: '유저를 찾을 수 없어요.',
      });
    }

    const hashedPassword = crypto
      .pbkdf2Sync(password, user.passwordSalt, 8, 64, 'sha512')
      .toString('base64');

    if (user.password !== hashedPassword) {
      throw new BadRequestException({
        code: 'WRONG_PASSWORD',
        message: '잘못된 비밀번호입니다.',
      });
    }

    const accessToken = this.generateAccessToken(user.id);

    return {
      accessToken: accessToken,
    };
  }

  public async deleteAccount(user: UserEntity) {
    await this.userRepository.delete({
      id: user.id,
    });
    return;
  }

  private generateAccessToken(userId: number) {
    const JWTToken = jwt.sign(
      {
        id: userId,
        type: 'user',
      },
      process.env.JWT_SECRET as string,
      {
        issuer: process.env.JWT_ISSUER as string,
      },
    );
    return JWTToken;
  }

  verify(JWTString: string) {
    try {
      const payload = jwt.verify(JWTString, process.env.JWT_SECRET) as (
        | jwt.JwtPayload
        | string
      ) & {
        id: string;
        type: string;
      };
      const { id, type } = payload;
      return {
        userId: id,
        type: type,
      };
    } catch (e) {
      throw new UnauthorizedException({
        code: 'WRONG_TOKEN',
      });
    }
  }
}
