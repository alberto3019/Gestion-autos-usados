import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import * as bcrypt from 'bcrypt';
import { RegisterAgencyDto } from './dto/register-agency.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private activityLogsService: ActivityLogsService,
    private emailService: EmailService,
  ) {}

  async registerAgency(dto: RegisterAgencyDto) {
    // Verificar si el email del usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.user.email },
    });
    if (existingUser) {
      throw new ConflictException('El email del usuario ya está registrado');
    }

    // Verificar si el email de la agencia ya existe
    const existingAgencyEmail = await this.prisma.agency.findUnique({
      where: { email: dto.agency.email },
    });
    if (existingAgencyEmail) {
      throw new ConflictException('El email de la agencia ya está registrado');
    }

    // Verificar si el CUIT ya existe
    const existingTaxId = await this.prisma.agency.findUnique({
      where: { taxId: dto.agency.taxId },
    });
    if (existingTaxId) {
      throw new ConflictException('El CUIT ya está registrado');
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(dto.user.password, 10);

    // Crear agencia con usuario admin
    const agency = await this.prisma.agency.create({
      data: {
        businessName: dto.agency.businessName,
        commercialName: dto.agency.commercialName,
        taxId: dto.agency.taxId,
        addressStreet: dto.agency.addressStreet,
        addressCity: dto.agency.addressCity,
        addressState: dto.agency.addressState,
        addressCountry: dto.agency.addressCountry || 'Argentina',
        phone: dto.agency.phone,
        whatsapp: dto.agency.whatsapp,
        email: dto.agency.email,
        instagramUrl: dto.agency.instagramUrl,
        facebookUrl: dto.agency.facebookUrl,
        websiteUrl: dto.agency.websiteUrl,
        status: 'pending',
        users: {
          create: {
            email: dto.user.email,
            passwordHash,
            firstName: dto.user.firstName,
            lastName: dto.user.lastName,
            role: 'agency_admin',
            isActive: true,
          },
        },
      },
      include: {
        users: true,
      },
    });

    // Log activity
    await this.activityLogsService.log({
      userId: agency.users[0].id,
      agencyId: agency.id,
      type: 'agency_registered',
      action: 'Registro de Agencia',
      description: `Nueva agencia registrada: ${agency.commercialName} (${dto.user.firstName} ${dto.user.lastName})`,
      metadata: {
        agencyId: agency.id,
        agencyName: agency.commercialName,
        taxId: agency.taxId,
      },
    });

    // Enviar email de bienvenida
    try {
      await this.emailService.sendWelcomeEmail(
        dto.user.email,
        `${dto.user.firstName} ${dto.user.lastName}`,
      );
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // No fallar el registro si falla el email
    }

    return {
      message: 'Agencia registrada exitosamente. Pendiente de aprobación.',
      agency: {
        id: agency.id,
        commercialName: agency.commercialName,
        status: agency.status,
      },
    };
  }

  async login(dto: LoginDto) {
    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { agency: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new ForbiddenException('Usuario desactivado');
    }

    // Si no es super admin, verificar estado de la agencia
    if (user.role !== 'super_admin') {
      if (!user.agency) {
        throw new ForbiddenException('Agencia no encontrada');
      }
      
      // Bloquear acceso si la agencia está bloqueada
      if (user.agency.status === 'blocked') {
        throw new ForbiddenException(
          'Tu agencia ha sido bloqueada. Por favor contacta al administrador.',
        );
      }
      
      // Bloquear acceso si la agencia está pendiente
      if (user.agency.status === 'pending') {
        throw new ForbiddenException(
          'Tu agencia está pendiente de aprobación. Por favor espera a que un administrador la active.',
        );
      }
      
      // Solo permitir acceso si la agencia está activa
      if (user.agency.status !== 'active') {
        throw new ForbiddenException('Tu agencia no tiene acceso a la plataforma.');
      }
    }

    // Generar tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Guardar refresh token
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // Log activity
    await this.activityLogsService.log({
      userId: user.id,
      agencyId: user.agencyId,
      type: 'user_login',
      action: 'Inicio de Sesión',
      description: `Usuario ${user.firstName} ${user.lastName} inició sesión`,
      metadata: {
        email: user.email,
        role: user.role,
        agencyName: user.agency?.commercialName,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        agency: user.agency
          ? {
              id: user.agency.id,
              commercialName: user.agency.commercialName,
              status: user.agency.status,
            }
          : null,
      },
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Acceso denegado');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Acceso denegado');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Sesión cerrada exitosamente' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Por seguridad, no revelamos si el email existe o no
    if (!user) {
      return {
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.',
      };
    }

    // Generar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Expira en 1 hora

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpires,
      },
    });

    // Enviar email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Hash de la nueva contraseña
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    // Actualizar contraseña y limpiar token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Log activity
    await this.activityLogsService.log({
      userId: user.id,
      agencyId: user.agencyId,
      type: 'user_updated',
      action: 'Restablecimiento de Contraseña',
      description: `Usuario ${user.firstName} ${user.lastName} restableció su contraseña`,
    });

    return {
      message: 'Contraseña restablecida exitosamente',
    };
  }
}

