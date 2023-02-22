import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Auth } from './decorator/auth.decorator';
import { GetPageDto } from './dto/getPage.dto';
import { GetPagesDto } from './dto/getPages.dto';
import { PatchPageDto } from './dto/patchPage.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('page')
  async getPage(@Query() dto: GetPageDto) {
    console.log(dto);
    if (dto.pageId) {
      console.log(dto.pageId);
      return await this.appService.getPage({
        type: 'pageId',
        pageId: dto.pageId,
      });
    } else {
      return await this.appService.getPage({
        type: 'pageCode',
        pageCode: dto.pageCode,
        domain: dto.domain || 'index',
      });
    }
  }

  @Get('pages')
  @Auth()
  async getPages(@Query() dto: GetPagesDto) {
    return await this.appService.getCachedPages(dto.page || 1);
  }

  @Patch('pages/:pageId')
  @Auth()
  async patchPage(@Param('pageId') pageId: string, @Body() dto: PatchPageDto) {
    return await this.appService.patchPage(pageId, dto);
  }

  @Delete('pages/:pageId')
  @Auth()
  async deletePage(@Param('pageId') pageId: string) {
    return await this.appService.deletePage(pageId);
  }
}
