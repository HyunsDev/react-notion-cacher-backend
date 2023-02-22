import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import * as dotenv from 'dotenv';
import * as path from 'path';
import { NotionPageEntity } from './entites/notionPage.entity';
import { UserEntity } from './entites/user.entity';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';

dotenv.config({
  path: path.resolve(
    process.env.NODE_ENV === 'production' ? '.production.env' : '.env',
  ),
});

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      charset: 'utf8mb4',
      synchronize: true,
    }),
    TypeOrmModule.forFeature([NotionPageEntity, UserEntity]),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
