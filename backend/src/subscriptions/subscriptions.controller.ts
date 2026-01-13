import {
  Controller,
  Get,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('me')
  @Roles('agency_admin', 'agency_user')
  async getMySubscription(@Request() req) {
    const subscription = await this.subscriptionsService.getAgencySubscription(
      req.user.agencyId,
    );

    if (!subscription) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    return subscription;
  }

  @Get('me/modules')
  @Roles('agency_admin', 'agency_user')
  async getMyEnabledModules(@Request() req) {
    const modules = await this.subscriptionsService.getEnabledModules(
      req.user.agencyId,
    );

    return { modules };
  }
}

