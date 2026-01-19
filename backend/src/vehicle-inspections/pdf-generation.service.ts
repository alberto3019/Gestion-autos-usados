import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { InspectionDataDto } from './dto/inspection-data.dto';

@Injectable()
export class PdfGenerationService {
  private s3Client: S3Client | null = null;
  private supabaseClient: SupabaseClient | null = null;
  private useS3: boolean;
  private useSupabase: boolean;
  private uploadDir: string;
  private templatesDir: string;

  constructor(private configService: ConfigService) {
    // Same storage logic as UploadService
    const supabaseUrl = this.configService.get('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey);
      this.useSupabase = true;
      this.useS3 = false;
    } else {
      this.useSupabase = false;
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
        this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
      }
    }

    // Templates directory
    this.templatesDir = path.join(process.cwd(), 'src', 'vehicle-inspections', 'templates');
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
    try {
      return await fs.readFile(templatePath, 'utf-8');
    } catch (error) {
      // Fallback: return basic HTML structure if template doesn't exist
      console.warn(`Template ${templateName} not found, using default`);
      return this.getDefaultTemplate();
    }
  }

  private async loadImageAsBase64(imageName: string): Promise<string> {
    const imagePath = path.join(this.templatesDir, 'images', imageName);
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const base64 = imageBuffer.toString('base64');
      const ext = path.extname(imageName).slice(1);
      return `data:image/${ext};base64,${base64}`;
    } catch (error) {
      console.warn(`Image ${imageName} not found:`, error);
      return '';
    }
  }

  private getDefaultTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Peritaje Vehicular</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { text-align: center; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background-color: #f0f0f0; font-weight: bold; }
    .section { margin: 20px 0; page-break-inside: avoid; }
  </style>
</head>
<body>
  <h1>PERITAJE MECÁNICO</h1>
  <div class="section">
    <h2>Información del Vehículo</h2>
    <p><strong>Marca:</strong> {{marca}}</p>
    <p><strong>Modelo:</strong> {{modelo}}</p>
    <p><strong>Año:</strong> {{año}}</p>
  </div>
  <!-- Add more sections as needed -->
</body>
</html>
    `;
  }

  private async savePdf(pdfBuffer: Buffer): Promise<string> {
    const fileName = `inspection-${crypto.randomUUID()}.pdf`;

    if (this.useSupabase && this.supabaseClient) {
      const bucketName = 'vehicles';
      const filePath = fileName;

      const { data, error } = await this.supabaseClient.storage
        .from(bucketName)
        .upload(filePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (error) {
        throw new Error(`Error al subir PDF a Supabase: ${error.message}`);
      }

      const { data: urlData } = this.supabaseClient.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } else if (this.useS3 && this.s3Client) {
      const bucketName = this.configService.get('AWS_S3_BUCKET');
      if (!bucketName) {
        throw new Error('Bucket S3 no configurado');
      }

      const key = `inspections/${fileName}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: pdfBuffer,
          ContentType: 'application/pdf',
          ACL: 'public-read',
        }),
      );

      const region = this.configService.get('AWS_REGION') || 'us-east-1';
      return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    } else {
      // Save locally
      await this.ensureUploadDir();
      const filePath = path.join(this.uploadDir, fileName);
      await fs.writeFile(filePath, pdfBuffer);

      const apiUrl = this.configService.get('API_URL') || 'http://localhost:3000';
      const baseUrl = this.configService.get('UPLOAD_BASE_URL') || '/uploads';
      return `${apiUrl}${baseUrl}/${fileName}`;
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

  async generatePdf(
    inspectionData: InspectionDataDto | Record<string, any>,
    vehicleInfo: {
      brand: string;
      model: string;
      year: number;
      color?: string;
      licensePlate?: string;
      kilometers?: number;
    },
    inspectorInfo: {
      inspectorName: string;
      inspectionDate: string;
      observations?: string;
    },
  ): Promise<Buffer> {
    // Load template
    const templateContent = await this.loadTemplate('completo');
    const template = handlebars.compile(templateContent);

    // Load images as base64
    const images = {
      front: await this.loadImageAsBase64('frente.png'),
      rear: await this.loadImageAsBase64('trasero.png'),
      side: await this.loadImageAsBase64('lateral acompañante.png'),
      sideDriver: await this.loadImageAsBase64('lateral conductor.png'),
      top: await this.loadImageAsBase64('arriba.png'),
    };

    // Prepare data for template
    const templateData = {
      vehicle: vehicleInfo,
      inspector: inspectorInfo,
      mecanico: inspectionData.mecanico || {},
      checklist: inspectionData.checklist || {},
      tren: inspectionData.tren || {},
      frenos: inspectionData.frenos || {},
      images,
    };

    // Render HTML
    const html = template(templateData);

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      // Set a longer timeout for images to load
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async generateAndSavePdf(
    inspectionData: InspectionDataDto | Record<string, any>,
    vehicleInfo: any,
    inspectorInfo: any,
  ): Promise<string> {
    const pdfBuffer = await this.generatePdf(inspectionData, vehicleInfo, inspectorInfo);
    return this.savePdf(pdfBuffer);
  }
}

