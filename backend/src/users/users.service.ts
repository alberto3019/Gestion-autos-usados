import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAgencyUsers(agencyId: string) {
    const users = await this.prisma.user.findMany({
      where: { agencyId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users;
  }

  async createUser(agencyId: string, dto: CreateUserDto) {
    // Verificar que el email no exista
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        agencyId,
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: (dto.role as UserRole) || UserRole.agency_user,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateUser(userId: string, agencyId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.agencyId !== agencyId) {
      throw new ForbiddenException(
        'No tienes permisos para editar este usuario',
      );
    }

    // No permitir cambiar el rol del primer usuario (admin)
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      include: {
        users: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    if (agency.users[0]?.id === userId && dto.role !== 'agency_admin') {
      throw new ForbiddenException(
        'No puedes cambiar el rol del administrador principal',
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role as UserRole,
        isActive: dto.isActive,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return updated;
  }

  async deleteUser(userId: string, agencyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.agencyId !== agencyId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este usuario',
      );
    }

    // No permitir eliminar al primer usuario (admin)
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      include: {
        users: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    if (agency.users[0]?.id === userId) {
      throw new ForbiddenException(
        'No puedes eliminar al administrador principal de la agencia',
      );
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Usuario eliminado exitosamente' };
  }
}

