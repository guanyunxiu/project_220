import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VolumesService } from './volumes.service';
import {
  CreateVolumeDto,
  UpdateVolumeDto,
  UpdateVolumeStatusDto,
  QueryVolumesDto,
  VolumeIdDto,
} from './dto/volumes.dto';
import {
  GetCurrentUserId,
  GetCurrentUser,
} from '../common/decorators/user.decorator';
import { Volume } from '../entities/volume.entity';
import { UserRole } from '../entities/user.entity';
import { PaginationResultDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('卷/集')
@Controller('volumes')
export class VolumesController {
  constructor(private readonly volumesService: VolumesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取卷列表' })
  findAll(@Query() queryVolumesDto: QueryVolumesDto): Promise<PaginationResultDto<Volume>> {
    return this.volumesService.findAll(queryVolumesDto);
  }

  @Public()
  @Get('work/:workId')
  @ApiOperation({ summary: '获取作品的所有卷' })
  findByWorkId(
    @Param('workId') workId: string,
    @Query('includeChapters') includeChapters: string = 'false',
  ): Promise<Volume[]> {
    return this.volumesService.findByWorkId(workId, includeChapters === 'true');
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取卷详情' })
  findOne(@Param() volumeIdDto: VolumeIdDto): Promise<Volume> {
    return this.volumesService.findById(volumeIdDto.id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建卷' })
  create(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
    @Body() createVolumeDto: CreateVolumeDto,
  ): Promise<Volume> {
    return this.volumesService.create(userId, userRole, createVolumeDto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新卷' })
  update(
    @Param() volumeIdDto: VolumeIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
    @Body() updateVolumeDto: UpdateVolumeDto,
  ): Promise<Volume> {
    return this.volumesService.update(volumeIdDto.id, userId, userRole, updateVolumeDto);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新卷状态' })
  updateStatus(
    @Param() volumeIdDto: VolumeIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
    @Body() updateVolumeStatusDto: UpdateVolumeStatusDto,
  ): Promise<Volume> {
    return this.volumesService.updateStatus(
      volumeIdDto.id,
      userId,
      userRole,
      updateVolumeStatusDto,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除卷' })
  remove(
    @Param() volumeIdDto: VolumeIdDto,
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('role') userRole: UserRole,
  ): Promise<void> {
    return this.volumesService.remove(volumeIdDto.id, userId, userRole);
  }
}
