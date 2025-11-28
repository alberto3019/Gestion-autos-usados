import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Request,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @Roles('agency_admin', 'agency_user')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No se proporcionó ningún archivo');
    }

    const url = await this.uploadService.uploadImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'jpeg',
    });

    return { url };
  }

  @Post('images')
  @Roles('agency_admin', 'agency_user')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new Error('No se proporcionaron archivos');
    }

    const urls = await this.uploadService.uploadMultipleImages(files, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
      format: 'jpeg',
    });

    return { urls };
  }
}

