import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class VehiclesService {
  constructor(
    private prisma: PrismaService,
    private activityLogsService: ActivityLogsService,
  ) {}

  /**
   * Normaliza la marca del vehículo: primera letra mayúscula, resto minúsculas
   * Ejemplo: "FORD" -> "Ford", "ford" -> "Ford", "FoRd" -> "Ford"
   */
  private normalizeBrand(brand: string): string {
    if (!brand || typeof brand !== 'string') return brand;
    const trimmed = brand.trim();
    if (trimmed.length === 0) return trimmed;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }

  async getMyVehicles(
    agencyId: string,
    page: number = 1,
    limit: number = 20,
    filters?: any,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      agencyId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    
    // Búsqueda general en marca, modelo o versión (tiene prioridad sobre brand/model individuales)
    if (filters?.search) {
      where.OR = [
        { brand: { contains: filters.search, mode: 'insensitive' } },
        { model: { contains: filters.search, mode: 'insensitive' } },
        { version: { contains: filters.search, mode: 'insensitive' } },
      ];
    } else {
      // Solo aplicar filtros individuales si no hay búsqueda general
      if (filters?.brand) {
        where.brand = { contains: filters.brand, mode: 'insensitive' };
      }
      if (filters?.model) {
        where.model = { contains: filters.model, mode: 'insensitive' };
      }
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        include: {
          photos: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      total,
      page,
      limit,
    };
  }

  async createVehicle(agencyId: string, userId: string, dto: CreateVehicleDto) {
    // Verificar que la agencia esté activa
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    if (agency.status !== 'active') {
      throw new ForbiddenException(
        'No puedes crear vehículos mientras tu agencia esté bloqueada o pendiente de aprobación',
      );
    }

    const vehicle = await this.prisma.vehicle.create({
      data: {
        agencyId,
        brand: this.normalizeBrand(dto.brand),
        model: dto.model,
        version: dto.version,
        year: dto.year,
        kilometers: dto.kilometers,
        fuelType: dto.fuelType,
        transmission: dto.transmission,
        color: dto.color,
        licensePlate: dto.licensePlate,
        hideLicensePlate: dto.hideLicensePlate,
        price: dto.price,
        currency: dto.currency,
        condition: dto.condition,
        status: dto.status,
        locationCity: dto.locationCity,
        locationState: dto.locationState,
        internalNotes: dto.internalNotes,
        publicNotes: dto.publicNotes,
        photos: {
          create: dto.photos.map((url, index) => ({
            url,
            order: index,
            isPrimary: index === 0,
          })),
        },
      },
      include: {
        photos: true,
      },
    });

    // Registrar actividad
    await this.activityLogsService.log({
      userId,
      agencyId,
      type: 'vehicle_created',
      action: 'Creación de Vehículo',
      description: `Vehículo creado: ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      metadata: { vehicleId: vehicle.id },
    });

    return vehicle;
  }

  async getVehicleById(vehicleId: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
        agency: {
          select: {
            id: true,
            commercialName: true,
            whatsapp: true,
            email: true,
            addressCity: true,
            addressState: true,
            instagramUrl: true,
            facebookUrl: true,
            websiteUrl: true,
            status: true,
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        agency: {
          select: {
            status: true,
          },
        },
      },
    });

    const isOwn = vehicle.agencyId === user.agencyId;

    // Si no es propio y la agencia no está activa, no permitir verlo
    if (!isOwn && vehicle.agency.status !== 'active') {
      throw new NotFoundException('Vehículo no disponible');
    }

    // Verificar si está en favoritos
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        userId,
        vehicleId,
      },
    });

    return {
      ...vehicle,
      isFavorite: !!favorite,
      isOwn,
    };
  }

  async updateVehicle(
    vehicleId: string,
    agencyId: string,
    userId: string,
    dto: UpdateVehicleDto,
  ) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    if (vehicle.agencyId !== agencyId) {
      throw new ForbiddenException('No tienes permisos para editar este vehículo');
    }

    // Verificar que la agencia esté activa
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (agency.status !== 'active') {
      throw new ForbiddenException(
        'No puedes editar vehículos mientras tu agencia esté bloqueada o pendiente de aprobación',
      );
    }

    // Extraer fotos del DTO
    const { photos, ...vehicleData } = dto as any;

    // Normalizar marca si viene en el DTO
    if (vehicleData.brand) {
      vehicleData.brand = this.normalizeBrand(vehicleData.brand);
    }

    // Actualizar datos del vehículo
    const updated = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: vehicleData,
      include: {
        photos: true,
      },
    });

    // Si se enviaron fotos, actualizar
    if (photos && Array.isArray(photos)) {
      // Eliminar fotos existentes
      await this.prisma.vehiclePhoto.deleteMany({
        where: { vehicleId },
      });

      // Crear nuevas fotos
      if (photos.length > 0) {
        await this.prisma.vehiclePhoto.createMany({
          data: photos.map((url: string, index: number) => ({
            vehicleId,
            url,
            order: index,
            isPrimary: index === 0,
          })),
        });
      }
    }

    // Registrar actividad
    await this.activityLogsService.log({
      userId,
      agencyId,
      type: 'vehicle_updated',
      action: 'Actualización de Vehículo',
      description: `Vehículo actualizado: ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      metadata: { vehicleId },
    });

    // Retornar vehículo actualizado con fotos
    return this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async updateVehicleStatus(
    vehicleId: string,
    agencyId: string,
    userId: string,
    dto: UpdateStatusDto,
  ) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    if (vehicle.agencyId !== agencyId) {
      throw new ForbiddenException('No tienes permisos para editar este vehículo');
    }

    // Verificar que la agencia esté activa
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (agency.status !== 'active') {
      throw new ForbiddenException(
        'No puedes cambiar el estado de vehículos mientras tu agencia esté bloqueada',
      );
    }

    const updated = await this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: dto.status },
    });

    // Registrar actividad
    await this.activityLogsService.log({
      userId,
      agencyId,
      type: 'vehicle_status_changed',
      action: 'Cambio de Estado',
      description: `Estado de vehículo cambiado: ${vehicle.brand} ${vehicle.model} ${vehicle.year} a "${dto.status}"`,
      metadata: { vehicleId, oldStatus: vehicle.status, newStatus: dto.status },
    });

    return updated;
  }

  async deleteVehicle(vehicleId: string, agencyId: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    if (vehicle.agencyId !== agencyId) {
      throw new ForbiddenException('No tienes permisos para eliminar este vehículo');
    }

    // Verificar que la agencia esté activa
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (agency.status !== 'active') {
      throw new ForbiddenException(
        'No puedes eliminar vehículos mientras tu agencia esté bloqueada',
      );
    }

    await this.prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    // Registrar actividad
    await this.activityLogsService.log({
      userId,
      agencyId,
      type: 'vehicle_deleted',
      action: 'Eliminación de Vehículo',
      description: `Vehículo eliminado: ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      metadata: { vehicleId },
    });

    return { message: 'Vehículo eliminado exitosamente' };
  }

  async bulkUpdateStatus(
    agencyId: string,
    userId: string,
    dto: BulkUpdateStatusDto,
  ) {
    // Verificar que la agencia esté activa
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    if (agency.status !== 'active') {
      throw new ForbiddenException(
        'No puedes cambiar el estado de vehículos mientras tu agencia esté bloqueada',
      );
    }

    // Verificar que todos los vehículos pertenezcan a la agencia
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        id: { in: dto.vehicleIds },
        agencyId,
      },
    });

    if (vehicles.length !== dto.vehicleIds.length) {
      throw new ForbiddenException(
        'Algunos vehículos no existen o no pertenecen a tu agencia',
      );
    }

    // Actualizar estado de todos los vehículos
    const result = await this.prisma.vehicle.updateMany({
      where: {
        id: { in: dto.vehicleIds },
        agencyId,
      },
      data: {
        status: dto.status,
      },
    });

    // Registrar actividad para cada vehículo
    for (const vehicle of vehicles) {
      await this.activityLogsService.log({
        userId,
        agencyId,
        type: 'vehicle_status_changed',
        action: 'Cambio de Estado Masivo',
        description: `Estado de vehículo cambiado: ${vehicle.brand} ${vehicle.model} ${vehicle.year} a "${dto.status}"`,
        metadata: {
          vehicleId: vehicle.id,
          oldStatus: vehicle.status,
          newStatus: dto.status,
          bulkOperation: true,
        },
      });
    }

    return {
      message: `${result.count} vehículo(s) actualizado(s) exitosamente`,
      count: result.count,
    };
  }

  async bulkDelete(agencyId: string, userId: string, dto: BulkDeleteDto) {
    // Verificar que la agencia esté activa
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    if (agency.status !== 'active') {
      throw new ForbiddenException(
        'No puedes eliminar vehículos mientras tu agencia esté bloqueada',
      );
    }

    // Verificar que todos los vehículos pertenezcan a la agencia
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        id: { in: dto.vehicleIds },
        agencyId,
      },
    });

    if (vehicles.length !== dto.vehicleIds.length) {
      throw new ForbiddenException(
        'Algunos vehículos no existen o no pertenecen a tu agencia',
      );
    }

    // Registrar actividad antes de eliminar
    for (const vehicle of vehicles) {
      await this.activityLogsService.log({
        userId,
        agencyId,
        type: 'vehicle_deleted',
        action: 'Eliminación Masiva de Vehículo',
        description: `Vehículo eliminado: ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
        metadata: { vehicleId: vehicle.id, bulkOperation: true },
      });
    }

    // Eliminar vehículos
    const result = await this.prisma.vehicle.deleteMany({
      where: {
        id: { in: dto.vehicleIds },
        agencyId,
      },
    });

    return {
      message: `${result.count} vehículo(s) eliminado(s) exitosamente`,
      count: result.count,
    };
  }

  async searchVehicles(dto: SearchVehiclesDto, userId: string) {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Solo vehículos disponibles por defecto (se puede cambiar)
    if (dto.status) {
      where.status = dto.status;
    } else {
      where.status = 'available';
    }

    // Solo mostrar vehículos de agencias activas (ocultar bloqueadas y pendientes)
    where.agency = {
      status: 'active',
    };

    // Búsqueda general en marca, modelo o versión
    if (dto.search) {
      where.OR = [
        { brand: { contains: dto.search, mode: 'insensitive' } },
        { model: { contains: dto.search, mode: 'insensitive' } },
        { version: { contains: dto.search, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos (tienen prioridad sobre la búsqueda general)
    if (dto.brand) {
      where.brand = { contains: dto.brand, mode: 'insensitive' };
    }
    if (dto.model) {
      where.model = { contains: dto.model, mode: 'insensitive' };
    }
    if (dto.version) {
      where.version = { contains: dto.version, mode: 'insensitive' };
    }
    if (dto.yearMin || dto.yearMax) {
      where.year = {};
      if (dto.yearMin) where.year.gte = dto.yearMin;
      if (dto.yearMax) where.year.lte = dto.yearMax;
    }
    if (dto.priceMin || dto.priceMax) {
      where.price = {};
      if (dto.priceMin) where.price.gte = dto.priceMin;
      if (dto.priceMax) where.price.lte = dto.priceMax;
    }
    if (dto.kilometersMax) {
      where.kilometers = { lte: dto.kilometersMax };
    }
    if (dto.fuelType) {
      where.fuelType = dto.fuelType;
    }
    if (dto.transmission) {
      where.transmission = dto.transmission;
    }
    if (dto.locationState) {
      where.locationState = { contains: dto.locationState, mode: 'insensitive' };
    }

    // Ordenamiento
    let orderBy: any = { createdAt: 'desc' };
    if (dto.sortBy === 'price') {
      orderBy = { price: dto.sortOrder || 'asc' };
    } else if (dto.sortBy === 'kilometers') {
      orderBy = { kilometers: dto.sortOrder || 'asc' };
    } else if (dto.sortBy === 'year') {
      orderBy = { year: dto.sortOrder || 'desc' };
    }

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
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
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    // Obtener IDs de favoritos del usuario
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: {
          select: { vehicleId: true },
        },
      },
    });

    const favoriteIds = user ? new Set(
      user.favorites.map((fav) => fav.vehicleId),
    ) : new Set();

    const vehiclesWithFavorites = vehicles.map((vehicle) => ({
      ...vehicle,
      isFavorite: favoriteIds.has(vehicle.id),
    }));

    return {
      data: vehiclesWithFavorites,
      total,
      page,
      limit,
    };
  }

  async exportVehicles(agencyId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { agencyId },
      include: {
        photos: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Preparar datos para Excel
    const excelData = vehicles.map((vehicle) => ({
      Marca: vehicle.brand,
      Modelo: vehicle.model,
      Versión: vehicle.version || '',
      Año: vehicle.year,
      Kilómetros: vehicle.kilometers,
      Combustible: vehicle.fuelType,
      Transmisión: vehicle.transmission,
      Color: vehicle.color || '',
      Patente: vehicle.licensePlate || '',
      Ocultar_Patente: vehicle.hideLicensePlate ? 'Sí' : 'No',
      Precio: vehicle.price.toString(),
      Moneda: vehicle.currency,
      Condición: vehicle.condition,
      Estado: vehicle.status,
      Ciudad: vehicle.locationCity || '',
      Provincia: vehicle.locationState || '',
      Notas_Internas: vehicle.internalNotes || '',
      Notas_Públicas: vehicle.publicNotes || '',
      Fotos: vehicle.photos.map((p) => p.url).join('; '),
    }));

    // Crear workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Ajustar ancho de columnas
    const columnWidths = [
      { wch: 15 }, // Marca
      { wch: 20 }, // Modelo
      { wch: 20 }, // Versión
      { wch: 8 }, // Año
      { wch: 12 }, // Kilómetros
      { wch: 12 }, // Combustible
      { wch: 12 }, // Transmisión
      { wch: 12 }, // Color
      { wch: 12 }, // Patente
      { wch: 15 }, // Ocultar_Patente
      { wch: 15 }, // Precio
      { wch: 8 }, // Moneda
      { wch: 12 }, // Condición
      { wch: 12 }, // Estado
      { wch: 15 }, // Ciudad
      { wch: 15 }, // Provincia
      { wch: 30 }, // Notas_Internas
      { wch: 30 }, // Notas_Públicas
      { wch: 50 }, // Fotos
    ];
    worksheet['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehículos');

    // Generar buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  }

  async importVehicles(
    agencyId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    // Verificar que la agencia esté activa
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    if (agency.status !== 'active') {
      throw new ForbiddenException(
        'No puedes importar vehículos mientras tu agencia esté bloqueada o pendiente de aprobación',
      );
    }

    // Leer archivo Excel
    let workbook;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } catch (error) {
      throw new BadRequestException('El archivo Excel no es válido');
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      throw new BadRequestException('El archivo Excel está vacío');
    }

    const results = {
      success: 0,
      errors: 0,
      errorsDetails: [] as Array<{ row: number; error: string }>,
    };

    // Mapeo de columnas (flexible, acepta diferentes nombres)
    const columnMap: Record<string, string> = {
      marca: 'brand',
      modelo: 'model',
      versión: 'version',
      version: 'version',
      año: 'year',
      year: 'year',
      kilómetros: 'kilometers',
      kilometros: 'kilometers',
      combustible: 'fuelType',
      'fuel type': 'fuelType',
      transmisión: 'transmission',
      transmission: 'transmission',
      color: 'color',
      patente: 'licensePlate',
      'license plate': 'licensePlate',
      ocultar_patente: 'hideLicensePlate',
      precio: 'price',
      moneda: 'currency',
      condición: 'condition',
      condition: 'condition',
      estado: 'status',
      ciudad: 'locationCity',
      'location city': 'locationCity',
      provincia: 'locationState',
      'location state': 'locationState',
      notas_internas: 'internalNotes',
      'internal notes': 'internalNotes',
      notas_públicas: 'publicNotes',
      'public notes': 'publicNotes',
      fotos: 'photos',
      photos: 'photos',
    };

    // Procesar cada fila
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      const rowNumber = i + 2; // +2 porque la fila 1 es el header

      try {
        // Mapear datos del Excel a nuestro formato
        const vehicleData: any = {};

        // Campos requeridos (todos excepto fotos)
        const brand = this.findValue(row, ['marca', 'brand']);
        const model = this.findValue(row, ['modelo', 'model']);
        const version = this.findValue(row, ['versión', 'version']);
        const year = this.findValue(row, ['año', 'year', 'ano']);
        const kilometers = this.findValue(row, [
          'kilómetros',
          'kilometros',
          'kilometers',
        ]);
        const fuelType = this.findValue(row, ['combustible', 'fueltype']);
        const transmission = this.findValue(row, [
          'transmisión',
          'transmission',
        ]);
        const color = this.findValue(row, ['color']);
        const licensePlate = this.findValue(row, ['patente', 'licenseplate']);
        const hideLicensePlate = this.findValue(row, ['ocultar_patente', 'hidelicenseplate']);
        const price = this.findValue(row, ['precio', 'price']);
        const currency = this.findValue(row, ['moneda', 'currency']);
        const condition = this.findValue(row, ['condición', 'condition']);
        const status = this.findValue(row, ['estado', 'status']);
        const locationCity = this.findValue(row, ['ciudad', 'locationcity']);
        const locationState = this.findValue(row, ['provincia', 'locationstate']);
        const internalNotes = this.findValue(row, ['notas_internas', 'internalnotes']);
        const publicNotes = this.findValue(row, ['notas_públicas', 'publicnotes']);

        // Validar campos requeridos (todos excepto fotos)
        const missingFields: string[] = [];
        if (!brand || String(brand).trim() === '') missingFields.push('marca');
        if (!model || String(model).trim() === '') missingFields.push('modelo');
        if (!version || String(version).trim() === '') missingFields.push('versión');
        if (!year) missingFields.push('año');
        if (!kilometers) missingFields.push('kilómetros');
        if (!fuelType || String(fuelType).trim() === '') missingFields.push('combustible');
        if (!transmission || String(transmission).trim() === '') missingFields.push('transmisión');
        if (!color || String(color).trim() === '') missingFields.push('color');
        if (!licensePlate || String(licensePlate).trim() === '') missingFields.push('patente');
        if (hideLicensePlate === null || hideLicensePlate === undefined || String(hideLicensePlate).trim() === '') missingFields.push('ocultar_patente');
        if (!price) missingFields.push('precio');
        if (!currency || String(currency).trim() === '') missingFields.push('moneda');
        if (!condition || String(condition).trim() === '') missingFields.push('condición');
        if (!status || String(status).trim() === '') missingFields.push('estado');
        if (!locationCity || String(locationCity).trim() === '') missingFields.push('ciudad');
        if (!locationState || String(locationState).trim() === '') missingFields.push('provincia');
        if (internalNotes === null || internalNotes === undefined) missingFields.push('notas_internas');
        if (publicNotes === null || publicNotes === undefined) missingFields.push('notas_públicas');

        if (missingFields.length > 0) {
          throw new Error(
            `Faltan campos requeridos: ${missingFields.join(', ')}`,
          );
        }

        vehicleData.brand = this.normalizeBrand(String(brand).trim());
        vehicleData.model = String(model).trim();
        vehicleData.version = String(version).trim();
        vehicleData.year = parseInt(String(year));
        vehicleData.kilometers = parseInt(String(kilometers));
        vehicleData.fuelType = this.normalizeFuelType(
          String(fuelType).toLowerCase(),
        ) as any;
        vehicleData.transmission = this.normalizeTransmission(
          String(transmission).toLowerCase(),
        ) as any;
        vehicleData.color = String(color).trim();
        vehicleData.licensePlate = String(licensePlate).trim();
        vehicleData.hideLicensePlate =
          String(hideLicensePlate).toLowerCase() === 'sí' ||
          String(hideLicensePlate).toLowerCase() === 'si' ||
          String(hideLicensePlate).toLowerCase() === 'yes' ||
          String(hideLicensePlate).toLowerCase() === 'true' ||
          hideLicensePlate === true ||
          hideLicensePlate === 1;
        vehicleData.price = parseFloat(String(price));
        vehicleData.currency = this.normalizeEnum(
          String(currency),
          ['ARS', 'USD', 'EUR'],
          'ARS',
        ) as any;
        vehicleData.condition = this.normalizeEnum(
          String(condition),
          ['new', 'used'],
          'used',
        ) as any;
        vehicleData.status = this.normalizeEnum(
          String(status),
          ['available', 'reserved', 'sold', 'paused'],
          'available',
        ) as any;
        vehicleData.locationCity = String(locationCity).trim();
        vehicleData.locationState = String(locationState).trim();
        vehicleData.internalNotes = internalNotes !== null && internalNotes !== undefined ? String(internalNotes).trim() : '';
        vehicleData.publicNotes = publicNotes !== null && publicNotes !== undefined ? String(publicNotes).trim() : '';

        // Validar año
        if (isNaN(vehicleData.year) || vehicleData.year < 1900) {
          throw new Error('Año inválido');
        }

        // Validar kilómetros
        if (isNaN(vehicleData.kilometers) || vehicleData.kilometers < 0) {
          throw new Error('Kilómetros inválidos');
        }

        // Validar precio
        if (isNaN(vehicleData.price) || vehicleData.price < 0) {
          throw new Error('Precio inválido');
        }

        // Fotos (opcional - separadas por ; o ,)
        const photosValue = this.findValue(row, ['fotos', 'photos']);
        let photos: string[] = [];
        if (photosValue) {
          const photosStr = String(photosValue);
          photos = photosStr
            .split(/[;,]/)
            .map((url) => url.trim())
            .filter((url) => url.length > 0);
        }

        // Crear vehículo
        const vehicle = await this.prisma.vehicle.create({
          data: {
            agencyId,
            brand: vehicleData.brand,
            model: vehicleData.model,
            version: vehicleData.version,
            year: vehicleData.year,
            kilometers: vehicleData.kilometers,
            fuelType: vehicleData.fuelType,
            transmission: vehicleData.transmission,
            color: vehicleData.color,
            licensePlate: vehicleData.licensePlate,
            hideLicensePlate: vehicleData.hideLicensePlate,
            price: vehicleData.price,
            currency: vehicleData.currency,
            condition: vehicleData.condition,
            status: vehicleData.status,
            locationCity: vehicleData.locationCity,
            locationState: vehicleData.locationState,
            internalNotes: vehicleData.internalNotes,
            publicNotes: vehicleData.publicNotes,
            photos: {
              create: photos.map((url, index) => ({
                url,
                order: index,
                isPrimary: index === 0,
              })),
            },
          },
          include: {
            photos: true,
          },
        });

        // Registrar actividad
        await this.activityLogsService.log({
          userId,
          agencyId,
          type: 'vehicle_created',
          action: 'Importación de Vehículo',
          description: `Vehículo importado: ${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
          metadata: { vehicleId: vehicle.id, imported: true },
        });

        results.success++;
      } catch (error) {
        results.errors++;
        results.errorsDetails.push({
          row: rowNumber,
          error: error.message || 'Error desconocido',
        });
      }
    }

    return results;
  }

  private findValue(row: any, keys: string[]): any {
    for (const key of keys) {
      // Buscar con diferentes variaciones
      const normalizedKey = this.normalizeColumnName(key);
      for (const rowKey in row) {
        if (this.normalizeColumnName(rowKey) === normalizedKey) {
          return row[rowKey];
        }
      }
    }
    return null;
  }

  private normalizeColumnName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private normalizeEnum(
    value: any,
    validValues: string[],
    defaultValue: string,
  ): string {
    if (!value) return defaultValue;
    const normalized = String(value).toLowerCase().trim();
    const found = validValues.find(
      (v) => v.toLowerCase() === normalized,
    );
    return found || defaultValue;
  }

  private normalizeFuelType(value: string): string {
    const mapping: Record<string, string> = {
      gasolina: 'gasoline',
      nafta: 'gasoline',
      diesel: 'diesel',
      gasoil: 'diesel',
      híbrido: 'hybrid',
      hybrid: 'hybrid',
      eléctrico: 'electric',
      electric: 'electric',
      otro: 'other',
      other: 'other',
    };
    return mapping[value] || 'other';
  }

  private normalizeTransmission(value: string): string {
    const mapping: Record<string, string> = {
      manual: 'manual',
      automática: 'automatic',
      automatic: 'automatic',
      cvt: 'cvt',
      otro: 'other',
      other: 'other',
    };
    return mapping[value] || 'manual';
  }
}

