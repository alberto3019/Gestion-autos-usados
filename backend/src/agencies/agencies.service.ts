import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAgencyDto } from './dto/update-agency.dto';

@Injectable()
export class AgenciesService {
  constructor(private prisma: PrismaService) {}

  async getMyAgency(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      include: {
        _count: {
          select: { vehicles: true, users: true },
        },
      },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    return {
      ...agency,
      vehicleCount: agency._count.vehicles,
      userCount: agency._count.users,
    };
  }

  async updateMyAgency(agencyId: string, dto: UpdateAgencyDto) {
    const agency = await this.prisma.agency.update({
      where: { id: agencyId },
      data: {
        commercialName: dto.commercialName,
        addressStreet: dto.addressStreet,
        addressCity: dto.addressCity,
        addressState: dto.addressState,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        instagramUrl: dto.instagramUrl,
        facebookUrl: dto.facebookUrl,
        websiteUrl: dto.websiteUrl,
        logoUrl: dto.logoUrl,
      },
    });

    return agency;
  }
}

