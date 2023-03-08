import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { ExtendedRecordMap } from 'notion-types';
import { Repository } from 'typeorm';

import { NotionAPI } from '../lib/notion-client';
import { NotionPageEntity } from './entites/notionPage.entity';
import { idToUuid } from './utils/idToUuid';

type PageDto = {
  pageId: string;
  pageCode?: string;
  domain: string;
  cachedAt: string;
  recordMap: ExtendedRecordMap;
};

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(NotionPageEntity)
    private notionPagesRepository: Repository<NotionPageEntity>,
  ) {}

  public async getPage(
    pageIdentifier:
      | {
          type: 'pageId';
          pageId: string;
        }
      | {
          type: 'pageCode';
          pageCode: string;
          domain: string;
        },
  ): Promise<PageDto> {
    let cache: NotionPageEntity;

    if (pageIdentifier.type === 'pageId') {
      cache = await this.notionPagesRepository.findOne({
        where: {
          pageId: pageIdentifier.pageId,
        },
      });
    } else {
      cache = await this.notionPagesRepository.findOne({
        where: {
          pageCode: pageIdentifier.pageCode,
          domain: pageIdentifier.domain,
        },
      });
    }

    if (cache) {
      // 캐시가 있을 경우
      if (cache.recordMap && dayjs(cache.cachedAt) > dayjs().add(-1, 'hour')) {
        return this.pageEntityToDto(cache);
      } else {
        const res = await this.reCachingPage(cache);
        return this.pageEntityToDto(res);
      }
    }

    if (pageIdentifier.type === 'pageCode') {
      throw new NotFoundException({
        code: 'PAGE_NOT_FOUND',
        message: '페이지를 찾을 수 없습니다.',
      });
    }

    const recordMap = await this.getFreshRecordMap(pageIdentifier.pageId);
    const newCache = new NotionPageEntity();
    newCache.pageId = pageIdentifier.pageId;
    newCache.recordMap = JSON.stringify(recordMap);
    newCache.cachedAt = new Date();
    const res = await this.notionPagesRepository.save(newCache);

    return this.pageEntityToDto(res);
  }
  public async getCachedPages(
    page = 1,
  ): Promise<{ pages: PageDto[]; page: number }> {
    const res = await this.notionPagesRepository.find({
      take: +(process.env.GET_PAGES_LIMIT || '50'),
      skip: +(process.env.GET_PAGES_LIMIT || '50') * (page - 1),
    });
    return {
      pages: res.map((e) => this.pageEntityToDto(e)),
      page: page,
    };
  }
  public async patchPage(
    pageId: string,
    value: {
      pageCode?: string;
      domain?: string;
      reCaching?: boolean;
      lazyReCaching?: boolean;
    },
  ) {
    const page = await this.notionPagesRepository.findOne({
      where: {
        pageId,
      },
    });

    if (!page) {
      throw new NotFoundException({
        code: 'PAGE_NOT_FOUND',
        message: '페이지를 찾을 수 없습니다.',
      });
    }

    if (value.pageCode) page.pageCode = value.pageCode;
    if (value.domain) page.domain = value.domain;
    if (value.lazyReCaching) {
      page.cachedAt = new Date(`1970-01-01T00:00:00Z`);
      page.recordMap = null;
    }
    if (value.reCaching) {
      page.recordMap = JSON.stringify(
        await this.getFreshRecordMap(page.pageId),
      );
      page.cachedAt = new Date();
    }
    await this.notionPagesRepository.save(page);
    return;
  }
  public async deletePage(pageId: string) {
    await this.notionPagesRepository.delete({
      pageId: pageId,
    });
    return;
  }

  private recordMapParser(rawRecordMap: string): ExtendedRecordMap {
    try {
      return JSON.parse(rawRecordMap);
    } catch (err) {
      if (err.name !== 'SyntaxError') throw err;
    }
  }

  private async getFreshRecordMap(pageId: string) {
    const notion = new NotionAPI();
    const recordMap = await notion.getPage(pageId);
    const pageUuid = idToUuid(pageId);
    if (
      recordMap.block[pageUuid].value.space_id !== process.env.NOTION_SPACE_ID
    ) {
      throw new BadRequestException({
        code: 'WRONG_SPACE_ID',
        message: '올바른 워크스페이스의 페이지가 아닙니다.',
      });
    }

    if (!recordMap) {
      throw new NotFoundException({
        code: 'PAGE_NOT_FOUND',
        message: '페이지를 찾을 수 없어요.',
      });
    }

    return recordMap;
  }

  private pageEntityToDto(page: NotionPageEntity): PageDto {
    return {
      pageId: page.pageId,
      pageCode: page.pageCode,
      domain: page.domain,
      cachedAt: page.cachedAt.toISOString(),
      recordMap: this.recordMapParser(page.recordMap),
    };
  }

  private async reCachingPage(page: NotionPageEntity) {
    const recordMap = await this.getFreshRecordMap(page.pageId);
    page.recordMap = JSON.stringify(recordMap);
    page.cachedAt = new Date();
    return await this.notionPagesRepository.save(page);
  }
}
