import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  SensitiveService,
  FilterResult,
  FilterTextDto,
  AddWordsDto,
  RemoveWordsDto,
} from './sensitive.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('敏感词')
@Controller('sensitive')
export class SensitiveController {
  constructor(private readonly sensitiveService: SensitiveService) {}

  @Public()
  @Post('filter')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '过滤敏感词' })
  filter(@Body() filterDto: FilterTextDto): Promise<FilterResult> {
    return Promise.resolve(this.sensitiveService.filter(filterDto.text));
  }

  @Public()
  @Post('check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '检查是否包含敏感词' })
  check(
    @Body() filterDto: FilterTextDto,
  ): Promise<{ hasSensitive: boolean; matchedWords: string[] }> {
    return Promise.resolve(this.sensitiveService.containsSensitive(filterDto.text));
  }

  @Get('words')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取所有敏感词（管理员）' })
  getAllWords(): Promise<{ words: string[]; total: number }> {
    return Promise.resolve(this.sensitiveService.getAllWords());
  }

  @Post('words')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '添加敏感词（管理员）' })
  addWords(@Body() addDto: AddWordsDto): Promise<{ added: number; total: number }> {
    return Promise.resolve(this.sensitiveService.addWords(addDto.words));
  }

  @Delete('words')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '移除敏感词（管理员）' })
  removeWords(
    @Body() removeDto: RemoveWordsDto,
  ): Promise<{ removed: number; total: number }> {
    return Promise.resolve(this.sensitiveService.removeWords(removeDto.words));
  }

  @Delete('words/all')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '清空所有敏感词（管理员）' })
  clearAll(): Promise<void> {
    this.sensitiveService.clearAll();
    return Promise.resolve();
  }
}
