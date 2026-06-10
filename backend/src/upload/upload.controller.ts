import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import {
  UploadImageDto,
  RichTextImageDto,
  UploadType,
  UploadResult,
} from './dto/upload.dto';
import { GetCurrentUserId } from '../common/decorators/user.decorator';

@ApiTags('上传')
@Controller('upload')
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '上传图片' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
      file: { type: 'string', format: 'binary' },
      type: { type: 'string', enum: Object.values(UploadType) },
      width: { type: 'number' },
      height: { type: 'number' },
      quality: { type: 'number' },
      format: { type: 'string' },
      watermark: { type: 'boolean' },
      relatedId: { type: 'string' },
    },
    required: ['file', 'type'],
  },
  })
  uploadImage(
  @UploadedFile() file: any,
  @Body() uploadDto: UploadImageDto,
  @GetCurrentUserId() userId: string,
  ): Promise<UploadResult> {
  return this.uploadService.uploadImage(file, uploadDto, userId);
}

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: '批量上传图片' })
  uploadImages(
  @UploadedFiles() files: any[],
  @Body('type') type: UploadType,
  @Body('relatedId') relatedId?: string,
  @GetCurrentUserId() userId?: string,
  ): Promise<string[]> {
  return this.uploadService.uploadRichTextImages(files, type, userId, relatedId);
}

  @Delete(':fileName')
  @ApiOperation({ summary: '删除文件' })
  deleteFile(@Param('fileName') fileName: string): Promise<void> {
    return this.uploadService.deleteFile(fileName);
  }
}
