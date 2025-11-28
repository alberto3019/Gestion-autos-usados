import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class UploadService {
  private s3Client: S3Client | null = null;
  private useS3: boolean;
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    this.useS3 = !!this.configService.get('AWS_ACCESS_KEY_ID');
    
    if (this.useS3) {
      const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
      const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
      
      if (accessKeyId && secretAccessKey) {
        this.s3Client = new S3Client({
          region: this.configService.get('AWS_REGION') || 'us-east-1',
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      } else {
        this.useS3 = false;
      }
    }
    
    if (!this.useS3) {
      // Usar almacenamiento local
      this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    }
  }

  private async ensureUploadDir() {
    if (!this.uploadDir) return;
    
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    },
  ): Promise<string> {
    // Validar tipo de archivo
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }

    const maxWidth = options?.maxWidth || 1920;
    const maxHeight = options?.maxHeight || 1080;
    const quality = options?.quality || 85;
    const format = options?.format || 'jpeg';

    // Procesar imagen con sharp
    let processedImage = sharp(file.buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });

    // Aplicar formato y compresión
    if (format === 'jpeg') {
      processedImage = processedImage.jpeg({ quality });
    } else if (format === 'png') {
      processedImage = processedImage.png({ quality });
    } else if (format === 'webp') {
      processedImage = processedImage.webp({ quality });
    }

    const processedBuffer = await processedImage.toBuffer();

    // Generar nombre único
    const fileName = `${crypto.randomUUID()}.${format}`;

    if (this.useS3 && this.s3Client) {
      // Subir a S3
      const bucketName = this.configService.get('AWS_S3_BUCKET');
      if (!bucketName) {
        throw new BadRequestException('Bucket S3 no configurado');
      }

      const key = `vehicles/${fileName}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: processedBuffer,
          ContentType: `image/${format}`,
          ACL: 'public-read',
        }),
      );

      // Retornar URL pública
      const region = this.configService.get('AWS_REGION') || 'us-east-1';
      return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    } else {
      // Guardar localmente
      await this.ensureUploadDir();
      const filePath = path.join(this.uploadDir, fileName);
      await fs.writeFile(filePath, processedBuffer);

      // Retornar URL absoluta para que funcione desde el frontend
      const apiUrl = this.configService.get('API_URL') || 'http://localhost:3000';
      const baseUrl = this.configService.get('UPLOAD_BASE_URL') || '/uploads';
      return `${apiUrl}${baseUrl}/${fileName}`;
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    options?: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    },
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, options));
    return Promise.all(uploadPromises);
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (this.useS3) {
      // Implementar eliminación de S3 si es necesario
      // Por ahora, las imágenes en S3 pueden tener políticas de expiración
      return;
    } else {
      // Eliminar archivo local
      try {
        const fileName = path.basename(imageUrl);
        const filePath = path.join(this.uploadDir, fileName);
        await fs.unlink(filePath);
      } catch (error) {
        // Ignorar errores si el archivo no existe
        console.error('Error deleting image:', error);
      }
    }
  }
}

