import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ManagementModule } from '@prisma/client';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class UserPermissionsService {
  constructor(private prisma: PrismaService) {}

  async getUserPermissions(userId: string) {
    const permissions = await this.prisma.userModulePermission.findMany({
      where: { userId },
    });

    return permissions;
  }

  async getUserPermissionsByModule(userId: string, module: ManagementModule) {
    const permission = await this.prisma.userModulePermission.findUnique({
      where: {
        userId_module: {
          userId,
          module,
        },
      },
    });

    return permission;
  }

  async createOrUpdatePermission(
    userId: string,
    agencyId: string,
    dto: CreatePermissionDto,
  ) {
    // Verify that the module is enabled for the agency
    const agencyModule = await this.prisma.agencyModule.findUnique({
      where: {
        agencyId_module: {
          agencyId,
          module: dto.module,
        },
      },
    });

    if (!agencyModule || !agencyModule.isEnabled) {
      throw new ForbiddenException(
        `El módulo ${dto.module} no está habilitado para esta agencia`,
      );
    }

    const permission = await this.prisma.userModulePermission.upsert({
      where: {
        userId_module: {
          userId,
          module: dto.module,
        },
      },
      create: {
        userId,
        module: dto.module,
        canView: dto.canView ?? false,
        canEdit: dto.canEdit ?? false,
        canDelete: dto.canDelete ?? false,
      },
      update: {
        canView: dto.canView ?? false,
        canEdit: dto.canEdit ?? false,
        canDelete: dto.canDelete ?? false,
      },
    });

    return permission;
  }

  async updatePermission(
    userId: string,
    module: ManagementModule,
    dto: UpdatePermissionDto,
  ) {
    const permission = await this.prisma.userModulePermission.findUnique({
      where: {
        userId_module: {
          userId,
          module,
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permiso no encontrado');
    }

    const updated = await this.prisma.userModulePermission.update({
      where: {
        userId_module: {
          userId,
          module,
        },
      },
      data: {
        canView: dto.canView ?? permission.canView,
        canEdit: dto.canEdit ?? permission.canEdit,
        canDelete: dto.canDelete ?? permission.canDelete,
      },
    });

    return updated;
  }

  async deletePermission(userId: string, module: ManagementModule) {
    await this.prisma.userModulePermission.delete({
      where: {
        userId_module: {
          userId,
          module,
        },
      },
    });
  }

  async hasPermission(
    userId: string,
    module: ManagementModule,
    action: 'view' | 'edit' | 'delete',
  ): Promise<boolean> {
    const permission = await this.prisma.userModulePermission.findUnique({
      where: {
        userId_module: {
          userId,
          module,
        },
      },
    });

    if (!permission) {
      return false;
    }

    switch (action) {
      case 'view':
        return permission.canView;
      case 'edit':
        return permission.canEdit;
      case 'delete':
        return permission.canDelete;
      default:
        return false;
    }
  }
}

