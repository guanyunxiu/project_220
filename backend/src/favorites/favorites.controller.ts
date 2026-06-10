import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import {
  CreateFavoriteDto,
  UpdateFavoriteDto,
  UpdateProgressDto,
  QueryFavoritesDto,
  FavoriteIdDto,
} from './dto/favorites.dto';
import { GetCurrentUserId } from '../common/decorators/user.decorator';
import { Favorite, FavoriteType } from '../entities/favorite.entity';
import { PaginationResultDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('收藏/书架')
@Controller('favorites')
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: '加入收藏/书架' })
  add(
    @GetCurrentUserId() userId: string,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ): Promise<Favorite> {
    return this.favoritesService.add(userId, createFavoriteDto);
  }

  @Delete('work/:workId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '取消收藏' })
  remove(
    @GetCurrentUserId() userId: string,
    @Param('workId') workId: string,
    @Query('type') type?: FavoriteType,
  ): Promise<void> {
    return this.favoritesService.remove(userId, workId, type);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '按ID删除收藏' })
  removeById(
    @GetCurrentUserId() userId: string,
    @Param() favoriteIdDto: FavoriteIdDto,
  ): Promise<void> {
    return this.favoritesService.removeById(userId, favoriteIdDto.id);
  }

  @Get()
  @ApiOperation({ summary: '获取我的收藏列表' })
  findAll(
    @GetCurrentUserId() userId: string,
    @Query() queryFavoritesDto: QueryFavoritesDto,
  ): Promise<PaginationResultDto<Favorite>> {
    return this.favoritesService.findAll(userId, queryFavoritesDto);
  }

  @Get('continue')
  @ApiOperation({ summary: '获取续接阅读列表' })
  getContinueReading(
    @GetCurrentUserId() userId: string,
    @Query('limit') limit: string = '10',
  ): Promise<Favorite[]> {
    return this.favoritesService.getContinueReading(userId, parseInt(limit, 10));
  }

  @Get('check/:workId')
  @ApiOperation({ summary: '检查是否已收藏' })
  checkFavorite(
    @GetCurrentUserId() userId: string,
    @Param('workId') workId: string,
    @Query('type') type?: FavoriteType,
  ): Promise<Favorite | null> {
    return this.favoritesService.checkFavorite(userId, workId, type);
  }

  @Post('progress/:workId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '同步阅读进度' })
  syncProgress(
    @GetCurrentUserId() userId: string,
    @Param('workId') workId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @Query('type') type?: FavoriteType,
  ): Promise<Favorite> {
    return this.favoritesService.syncProgress(userId, workId, updateProgressDto, type);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取收藏详情' })
  findOne(@Param() favoriteIdDto: FavoriteIdDto): Promise<Favorite> {
    return this.favoritesService.findById(favoriteIdDto.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新收藏设置' })
  update(
    @GetCurrentUserId() userId: string,
    @Param() favoriteIdDto: FavoriteIdDto,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ): Promise<Favorite> {
    return this.favoritesService.update(userId, favoriteIdDto.id, updateFavoriteDto);
  }
}
