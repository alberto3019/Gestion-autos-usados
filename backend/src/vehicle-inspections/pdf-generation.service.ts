import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { existsSync, readdirSync } from 'fs';
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

    // Register Handlebars helpers
    handlebars.registerHelper('eq', function(a: any, b: any) {
      return a === b;
    });

    // Prepare data for template
    const templateData = {
      vehicle: vehicleInfo,
      inspector: inspectorInfo,
      mecanico: inspectionData.mecanico || {},
      checklist: inspectionData.checklist || {},
      tren: inspectionData.tren || {},
      frenos: inspectionData.frenos || {},
      danosDiagrama: inspectionData.danosDiagrama || {},
      images,
    };

    // Render HTML
    const html = template(templateData);

    // Generate PDF with Puppeteer
    // Configure for production environments like Render.com
    let executablePath = this.configService.get('PUPPETEER_EXECUTABLE_PATH') || 
      process.env.PUPPETEER_EXECUTABLE_PATH;
    
    // Configure cache path for Render.com (default: /opt/render/.cache/puppeteer)
    const cacheDir = process.env.PUPPETEER_CACHE_DIR || 
      this.configService.get('PUPPETEER_CACHE_DIR') || 
      '/opt/render/.cache/puppeteer';
    
    // Set cache directory for Puppeteer BEFORE calling executablePath()
    // This is critical for Render.com
    if (process.env.RENDER || !process.env.PUPPETEER_CACHE_DIR) {
      process.env.PUPPETEER_CACHE_DIR = cacheDir;
      // Also set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD if Chrome is already installed
      if (!process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD) {
        process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
      }
    }

    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // Important for Render.com
        '--disable-extensions',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-web-security', // Allow loading local images
        '--disable-features=IsolateOrigins,site-per-process', // Help with rendering
      ],
      timeout: 60000, // 60 seconds timeout for browser launch
    };

    // Try to use Puppeteer's bundled Chrome first (installed via postinstall/npx puppeteer browsers install)
    if (!executablePath) {
      try {
        // Set cache dir before calling executablePath
        const puppeteerExecutable = puppeteer.executablePath();
        if (puppeteerExecutable && existsSync(puppeteerExecutable)) {
          executablePath = puppeteerExecutable;
          console.log('✅ Using Puppeteer bundled Chrome:', executablePath);
        } else {
          console.warn('⚠️ Puppeteer executablePath() returned:', puppeteerExecutable);
        }
      } catch (e) {
        console.warn('⚠️ Error calling puppeteer.executablePath():', e);
      }
    }

    // Try to find Chrome in Render.com cache directory directly
    if (!executablePath && process.env.RENDER) {
      console.log('🔍 Searching for Chrome in Render cache directory:', cacheDir);
      
      // Check if cache directory exists
      if (existsSync(cacheDir)) {
        console.log('✅ Cache directory exists:', cacheDir);
        try {
          const cacheContents = readdirSync(cacheDir);
          console.log('📁 Cache directory contents:', cacheContents);
        } catch (e) {
          console.warn('⚠️ Could not read cache directory:', e);
        }
      } else {
        console.warn('⚠️ Cache directory does not exist:', cacheDir);
      }
      
      const renderChromePaths = [
        `${cacheDir}/chrome/linux-143.0.7499.192/chrome-linux64/chrome`,
      ];
      
      // Try exact version path first
      if (existsSync(renderChromePaths[0])) {
        executablePath = renderChromePaths[0];
        console.log('✅ Using Chrome from Render cache:', executablePath);
      } else {
        console.warn('⚠️ Chrome not found at exact path:', renderChromePaths[0]);
        
        // Try to find any chrome version in cache
        try {
          const chromeDir = `${cacheDir}/chrome`;
          if (existsSync(chromeDir)) {
            console.log('✅ Chrome directory exists:', chromeDir);
            const versions = readdirSync(chromeDir);
            console.log('📦 Available Chrome versions:', versions);
            
            for (const version of versions) {
              const chromePath = `${chromeDir}/${version}/chrome-linux64/chrome`;
              console.log('🔍 Checking path:', chromePath);
              if (existsSync(chromePath)) {
                executablePath = chromePath;
                console.log('✅ Using Chrome from Render cache (found version):', executablePath);
                break;
              } else {
                console.warn('⚠️ Chrome not found at:', chromePath);
              }
            }
          } else {
            console.warn('⚠️ Chrome directory does not exist:', chromeDir);
          }
        } catch (e) {
          console.warn('⚠️ Could not search Render cache directory:', e);
        }
      }
    }

    // Try to find Chrome in common system locations if Puppeteer's Chrome not found
    if (!executablePath) {
      const commonPaths = [
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/snap/bin/chromium',
      ];
      
      for (const path of commonPaths) {
        try {
          if (existsSync(path)) {
            executablePath = path;
            console.log('✅ Using system Chrome:', executablePath);
            break;
          }
        } catch (e) {
          // Continue searching
        }
      }
    }

    // Use explicit Chrome path if found or provided
    if (executablePath) {
      launchOptions.executablePath = executablePath;
      console.log('🚀 Launching Puppeteer with Chrome at:', executablePath);
    } else {
      console.error('❌ No Chrome executable found!');
      console.error('Cache directory:', cacheDir);
      console.error('RENDER env:', process.env.RENDER);
      console.error('PUPPETEER_CACHE_DIR env:', process.env.PUPPETEER_CACHE_DIR);
      
      // Last resort: Try to install Chrome in runtime (this is slow but may work)
      if (process.env.RENDER) {
        console.log('🔄 Attempting to install Chrome in runtime...');
        try {
          const { execSync } = require('child_process');
          execSync('npx puppeteer browsers install chrome', { 
            stdio: 'inherit',
            timeout: 120000, // 2 minutes timeout
            env: { ...process.env, PUPPETEER_CACHE_DIR: cacheDir }
          });
          
          // Try puppeteer.executablePath() again after installation
          const puppeteerExecutable = puppeteer.executablePath();
          if (puppeteerExecutable && existsSync(puppeteerExecutable)) {
            executablePath = puppeteerExecutable;
            launchOptions.executablePath = executablePath;
            console.log('✅ Chrome installed and found at:', executablePath);
          } else {
            throw new Error(
              `Chrome installation completed but executable not found. ` +
              `Cache directory: ${cacheDir}. ` +
              `Please ensure Chrome is installed during build with: npx puppeteer browsers install chrome`
            );
          }
        } catch (installError) {
          console.error('❌ Failed to install Chrome in runtime:', installError);
          throw new Error(
            `No Chrome executable found and runtime installation failed. ` +
            `Cache directory: ${cacheDir}. ` +
            `Please ensure Chrome is installed during build with: npx puppeteer browsers install chrome. ` +
            `Error: ${installError.message}`
          );
        }
      } else {
        throw new Error(
          `No Chrome executable found. Cache directory: ${cacheDir}. ` +
          `Please ensure Chrome is installed during build with: npx puppeteer browsers install chrome`
        );
      }
    }

    const browser = await puppeteer.launch(launchOptions);

    try {
      const page = await browser.newPage();
      
      // Set reasonable timeouts for page operations
      page.setDefaultNavigationTimeout(10000); // 10 seconds (should be enough for static HTML)
      page.setDefaultTimeout(10000); // 10 seconds
      
      // Since images are base64-encoded (data URIs), we don't need to wait for network
      // Use 'load' which waits for DOM and resources to load (much faster than networkidle)
      await page.setContent(html, { 
        waitUntil: 'load', // 'load' is much faster - waits for DOM and embedded resources only
        timeout: 10000 // 10 seconds should be plenty for static HTML with base64 images
      });
      
      // Small delay to ensure all base64 images are rendered
      await page.waitForTimeout(500); // 500ms should be enough for base64 images

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

