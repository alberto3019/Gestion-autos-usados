import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@Request() req) {
    return this.favoritesService.getFavorites(req.user.sub);
  }

  @Post()
  async addFavorite(@Request() req, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.addFavorite(req.user.sub, dto.vehicleId);
  }

  @Delete(':id')
  async removeFavorite(@Request() req, @Param('id') id: string) {
    return this.favoritesService.removeFavorite(id, req.user.sub);
  }
}

