import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class FavoritesService {
  constructor(
    private prisma: PrismaService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId,
        vehicle: {
          agency: {
            status: 'active', // Solo mostrar favoritos de agencias activas
          },
        },
      },
      include: {
        vehicle: {
          include: {
            photos: {
              where: { isPrimary: true },
              take: 1,
            },
            agency: {
              select: {
                id: true,
                commercialName: true,
                addressCity: true,
                addressState: true,
                whatsapp: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites.map((fav) => ({
      id: fav.id,
      createdAt: fav.createdAt,
      vehicle: fav.vehicle,
    }));
  }

  async addFavorite(userId: string, vehicleId: string) {
    // Verificar que el vehículo existe y la agencia está activa
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        agency: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    // Verificar que la agencia del vehículo está activa
    if (vehicle.agency.status !== 'active') {
      throw new BadRequestException(
        'No puedes marcar como favorito vehículos de agencias inactivas',
      );
    }

    // Obtener el agencyId del usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // No permitir marcar como favorito vehículos propios
    if (vehicle.agencyId === user.agencyId) {
      throw new BadRequestException(
        'No puedes marcar como favorito tus propios vehículos',
      );
    }

    // Verificar si ya existe
    const existingFavorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        vehicleId,
      },
    });

    if (existingFavorite) {
      throw new ConflictException('El vehículo ya está en favoritos');
    }

    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        vehicleId,
      },
      include: {
        vehicle: {
          include: {
            photos: true,
            agency: true,
          },
        },
      },
    });

    // Registrar actividad
    await this.activityLogsService.log({
      userId,
      agencyId: user.agencyId,
      type: 'favorite_added',
      action: 'Favorito Agregado',
      description: `Favorito agregado: ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      metadata: { vehicleId, favoriteId: favorite.id },
    });

    return favorite;
  }

  async removeFavorite(favoriteId: string, userId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        id: favoriteId,
        userId,
      },
      include: {
        vehicle: true,
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    await this.prisma.favorite.delete({
      where: { id: favoriteId },
    });

    // Registrar actividad
    await this.activityLogsService.log({
      userId,
      agencyId: user.agencyId,
      type: 'favorite_removed',
      action: 'Favorito Removido',
      description: `Favorito removido: ${favorite.vehicle.brand} ${favorite.vehicle.model} ${favorite.vehicle.year}`,
      metadata: { vehicleId: favorite.vehicleId },
    });

    return { message: 'Favorito eliminado exitosamente' };
  }
}

