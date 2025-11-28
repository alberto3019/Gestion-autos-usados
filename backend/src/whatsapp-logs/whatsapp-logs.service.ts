import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class WhatsappLogsService {
  constructor(
    private prisma: PrismaService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async logWhatsappClick(userId: string, vehicleId: string) {
    // Verificar que el vehículo existe
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        agency: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const log = await this.prisma.whatsappClickLog.create({
      data: {
        userId,
        vehicleId,
      },
    });

    // Registrar actividad
    await this.activityLogsService.log({
      userId,
      agencyId: user.agencyId,
      type: 'whatsapp_contact',
      action: 'Contacto WhatsApp',
      description: `Contactó por WhatsApp para: ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      metadata: { vehicleId, targetAgencyId: vehicle.agencyId },
    });

    return log;
  }
}

