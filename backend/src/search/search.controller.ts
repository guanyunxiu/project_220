import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import {
  SearchQueryDto,
  ReindexDto,
  SearchIndexType,
  SearchResult,
} from './dto/search.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('搜索')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '搜索作品和章节' })
  search(@Query() query: SearchQueryDto): Promise<SearchResult<any>> {
    return this.searchService.search(query);
  }

  @Post('reindex')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: '重建索引（管理员）' })
  async reindex(@Body() reindexDto: ReindexDto): Promise<{ message: string }> {
    const types = reindexDto.types || [
      SearchIndexType.WORKS,
      SearchIndexType.CHAPTERS,
    ];

    if (types.includes(SearchIndexType.WORKS)) {
      await this.searchService.reindexWorks();
    }
    if (types.includes(SearchIndexType.CHAPTERS)) {
      await this.searchService.reindexChapters();
    }

    return { message: '重建索引任务已启动' };
  }
}
