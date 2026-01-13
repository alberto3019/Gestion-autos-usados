import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { ManagementModule } from '@prisma/client';

export const MODULE_PERMISSION_KEY = 'module_permission';
export const RequireModulePermission = (module: ManagementModule) =>
  SetMetadata(MODULE_PERMISSION_KEY, module);

@Injectable()
export class ModulePermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.get<ManagementModule>(
      MODULE_PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredModule) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Super admin has access to everything
    if (user.role === 'super_admin') {
      return true;
    }

    // Agency admin has access to all modules enabled for their agency
    if (user.role === 'agency_admin') {
      const agencyModule = await this.prisma.agencyModule.findUnique({
        where: {
          agencyId_module: {
            agencyId: user.agencyId,
            module: requiredModule,
          },
        },
      });

      if (!agencyModule || !agencyModule.isEnabled) {
        throw new ForbiddenException(
          `Módulo ${requiredModule} no está habilitado para esta agencia`,
        );
      }

      return true;
    }

    // Agency users need specific permissions
    const permission = await this.prisma.userModulePermission.findUnique({
      where: {
        userId_module: {
          userId: user.id,
          module: requiredModule,
        },
      },
    });

    if (!permission || !permission.canView) {
      throw new ForbiddenException(
        `No tienes permiso para acceder al módulo ${requiredModule}`,
      );
    }

    return true;
  }
}

