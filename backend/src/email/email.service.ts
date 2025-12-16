import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    // Inicialización lazy - no crear transporter hasta que sea necesario
    // Esto evita errores si las credenciales no están configuradas
    this.isConfigured = false;
  }

  private getTransporter(): nodemailer.Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');
    
    if (!smtpUser || !smtpPass) {
      return null;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
        port: parseInt(this.configService.get('SMTP_PORT') || '587'),
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.isConfigured = true;
      return this.transporter;
    } catch (error) {
      console.warn('Email service not configured. Emails will not be sent.');
      this.isConfigured = false;
      return null;
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    const transporter = this.getTransporter();
    
    if (!transporter) {
      console.warn(`Email not sent (service not configured): ${subject} to ${to}`);
      return null;
    }

    try {
      const info = await transporter.sendMail({
        from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      // No lanzar error, solo loguear para no romper el flujo
      return null;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a AutoStock360!</h1>
            </div>
            <div class="content">
              <p>Hola ${userName},</p>
              <p>Te damos la bienvenida a nuestra plataforma. Tu cuenta ha sido creada exitosamente.</p>
              <p>Ahora puedes:</p>
              <ul>
                <li>Buscar vehículos disponibles</li>
                <li>Guardar tus favoritos</li>
                <li>Crear alertas de búsqueda</li>
                <li>Contactar con agencias</li>
              </ul>
              <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}" class="button">Acceder a la plataforma</a>
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <p>Saludos,<br>El equipo de AutoStock360</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(userEmail, 'Bienvenido a AutoStock360', html);
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .warning { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Recuperación de Contraseña</h1>
            </div>
            <div class="content">
              <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
              <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este email.
              </div>
              <p>Saludos,<br>El equipo de AutoStock360</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(userEmail, 'Recuperación de Contraseña - AutoStock360', html);
  }

  async sendSearchAlertEmail(userEmail: string, userName: string, alertName: string, vehicles: any[]) {
    const vehiclesList = vehicles.map(v => `
      <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 5px;">
        <h3 style="margin: 0 0 10px 0;">${v.brand} ${v.model} ${v.version || ''}</h3>
        <p style="margin: 5px 0;"><strong>Año:</strong> ${v.year} | <strong>Km:</strong> ${v.kilometers.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>Precio:</strong> $${v.price.toLocaleString()} ${v.currency}</p>
        <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/vehicles/${v.id}" style="color: #2563eb;">Ver detalles →</a>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nueva Alerta de Búsqueda</h1>
            </div>
            <div class="content">
              <p>Hola ${userName},</p>
              <p>Hemos encontrado <strong>${vehicles.length}</strong> vehículo(s) que coinciden con tu alerta "<strong>${alertName}</strong>":</p>
              ${vehiclesList}
              <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/search-alerts" class="button">Ver todas mis alertas</a>
              <p>Saludos,<br>El equipo de AutoStock360</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(userEmail, `Nuevos vehículos encontrados - ${alertName}`, html);
  }

  async sendAgencyApprovalEmail(agencyEmail: string, agencyName: string) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Agencia Aprobada</h1>
            </div>
            <div class="content">
              <p>¡Felicitaciones ${agencyName}!</p>
              <p>Tu agencia ha sido aprobada y ya está activa en nuestra plataforma.</p>
              <p>Ahora puedes:</p>
              <ul>
                <li>Subir vehículos</li>
                <li>Gestionar tu inventario</li>
                <li>Recibir consultas de clientes</li>
              </ul>
              <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}" class="button">Acceder a tu cuenta</a>
              <p>Saludos,<br>El equipo de AutoStock360</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(agencyEmail, 'Agencia Aprobada - AutoStock360', html);
  }
}

