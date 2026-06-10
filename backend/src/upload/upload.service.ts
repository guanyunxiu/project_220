import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { UploadImageDto, UploadResult, UploadType, ImageFormat } from './dto/upload.dto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private minioClient: Minio.Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('minio.bucket');
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endPoint'),
      port: this.configService.get<number>('minio.port'),
      useSSL: this.configService.get<boolean>('minio.useSSL'),
      accessKey: this.configService.get<string>('minio.accessKey'),
      secretKey: this.configService.get<string>('minio.secretKey'),
    });
    this.ensureBucket();
  }

  private async ensureBucket(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`Bucket ${this.bucket} created`);
      }
    } catch (error) {
      this.logger.error('Failed to ensure bucket', error);
    }
  }

  async uploadImage(
    file: any,
    uploadDto: UploadImageDto,
    userId: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('未上传文件');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的图片格式');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('图片大小不能超过10MB');
    }

    try {
      let processedBuffer: Buffer;
      let metadata: sharp.Metadata;
      let outputFormat: ImageFormat = uploadDto.format || ImageFormat.WEBP;

      let sharpInstance = sharp(file.buffer).rotate();

      if (uploadDto.width || uploadDto.height) {
        sharpInstance = sharpInstance.resize(
          uploadDto.width || null,
          uploadDto.height || null,
          {
            fit: 'inside',
            withoutEnlargement: true,
          },
        );
      }

      if (uploadDto.watermark) {
        sharpInstance = await this.addWatermark(sharpInstance);
      }

      const quality = uploadDto.quality || 80;
      switch (outputFormat) {
        case ImageFormat.JPEG:
          sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
          break;
        case ImageFormat.PNG:
          sharpInstance = sharpInstance.png({ quality: Math.round(quality / 100 * 9) });
          break;
        case ImageFormat.WEBP:
        default:
          sharpInstance = sharpInstance.webp({ quality });
          outputFormat = ImageFormat.WEBP;
          break;
      }

      processedBuffer = await sharpInstance.toBuffer();
      metadata = await sharp(processedBuffer).metadata();

      const folderPath = this.getFolderPath(uploadDto.type, userId);
      const fileName = `${uuidv4()}.${outputFormat}`;
      const objectName = `${folderPath}/${fileName}`;

      await this.minioClient.putObject(
        this.bucket,
        objectName,
        processedBuffer,
        processedBuffer.length,
        {
          'Content-Type': `image/${outputFormat}`,
          'x-amz-meta-original-name': file.originalname,
          'x-amz-meta-user-id': userId,
          'x-amz-meta-related-id': uploadDto.relatedId || '',
        },
      );

      const url = await this.getPublicUrl(objectName);

      return {
        url,
        originalName: file.originalname,
        fileName: objectName,
        size: processedBuffer.length,
        width: metadata.width || 0,
        height: metadata.height || 0,
        mimeType: `image/${outputFormat}`,
        format: outputFormat,
      };
    } catch (error) {
      this.logger.error('Image upload failed', error);
      throw new InternalServerErrorException('图片上传失败');
    }
  }

  async uploadRichTextImages(
    files: any[],
    type: UploadType,
    userId: string,
    relatedId?: string,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('未上传文件');
    }

    const results: string[] = [];

    for (const file of files) {
      const result = await this.uploadImage(
        file,
        {
          type,
          format: ImageFormat.WEBP,
          quality: 80,
          watermark: false,
          relatedId,
        },
        userId,
      );
      results.push(result.url);
    }

    return results;
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucket, fileName);
    } catch (error) {
      this.logger.error('File deletion failed', error);
      throw new InternalServerErrorException('文件删除失败');
    }
  }

  async deleteFiles(fileNames: string[]): Promise<void> {
    for (const fileName of fileNames) {
      await this.deleteFile(fileName);
    }
  }

  private async addWatermark(sharpInstance: sharp.Sharp): Promise<sharp.Sharp> {
    const watermarkText = 'Novel Platform';
    const metadata = await sharpInstance.metadata();
    const width = metadata.width || 800;
    const watermarkSvg = `
      <svg width="${width}" height="${Math.round(width * 0.1)}">
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.round(width * 0.03)}" fill="rgba(255,255,255,0.3)" text-anchor="middle" dominant-baseline="middle">
          ${watermarkText}
        </text>
      </svg>
    `;
    const watermarkBuffer = Buffer.from(watermarkSvg);

    return sharpInstance.composite([
      {
        input: watermarkBuffer,
        gravity: 'southeast',
      },
    ]);
  }

  private getFolderPath(type: UploadType, userId: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const typeFolder: Record<UploadType, string> = {
      [UploadType.AVATAR]: 'avatars',
      [UploadType.COVER]: 'covers',
      [UploadType.BANNER]: 'banners',
      [UploadType.CHAPTER_IMAGE]: 'chapters',
      [UploadType.CONTENT_IMAGE]: 'contents',
      [UploadType.THUMBNAIL]: 'thumbnails',
      [UploadType.OTHER]: 'others',
    };

    return `${typeFolder[type] || 'others'}/${year}/${month}/${day}/${userId}`;
  }

  private async getPublicUrl(objectName: string): Promise<string> {
    const endPoint = this.configService.get<string>('minio.endPoint');
    const port = this.configService.get<number>('minio.port');
    const useSSL = this.configService.get<boolean>('minio.useSSL');
    const protocol = useSSL ? 'https' : 'http';

    return `${protocol}://${endPoint}:${port}/${this.bucket}/${objectName}`;
  }
}
