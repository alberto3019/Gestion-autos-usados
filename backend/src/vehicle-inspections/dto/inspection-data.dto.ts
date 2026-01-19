import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  ValidateNested,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InspectionHeaderDto {
  @IsString()
  fecha: string;

  @IsNumber()
  @Min(0)
  kilometraje: number;

  @IsString()
  propietario: string;

  @IsString()
  titularRegistral: string;

  @IsString()
  dominio: string;

  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsNumber()
  @Min(1900)
  @Max(2100)
  año: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  titularPlan?: string;

  @IsString()
  @IsOptional()
  numeroSuscripcion?: string;
}

export class StereoSectionDto {
  @IsString()
  @IsOptional()
  marca?: string;

  @IsBoolean()
  @IsOptional()
  radioPc?: boolean;

  @IsBoolean()
  @IsOptional()
  radioCd?: boolean;

  @IsBoolean()
  @IsOptional()
  mp3?: boolean;

  @IsBoolean()
  @IsOptional()
  usb?: boolean;

  @IsBoolean()
  @IsOptional()
  bluetooth?: boolean;

  @IsBoolean()
  @IsOptional()
  aux?: boolean;

  @IsBoolean()
  @IsOptional()
  ipod?: boolean;

  @IsString()
  @IsOptional()
  pantallaPulgadas?: string;

  @IsEnum(['si', 'no', ''])
  @IsOptional()
  extraible?: string;

  @IsEnum(['si', 'no', ''])
  @IsOptional()
  loTrajo?: string;
}

export class TransmisionSectionDto {
  @IsBoolean()
  @IsOptional()
  cajaManual?: boolean;

  @IsBoolean()
  @IsOptional()
  tresCuatroMarchas?: boolean;

  @IsBoolean()
  @IsOptional()
  mt5?: boolean;

  @IsBoolean()
  @IsOptional()
  mt6?: boolean;

  @IsString()
  @IsOptional()
  atNumeroMarchas?: string;

  @IsString()
  @IsOptional()
  marca?: string;
}

export class DireccionDto {
  @IsBoolean()
  @IsOptional()
  hidraulica?: boolean;

  @IsBoolean()
  @IsOptional()
  electrica?: boolean;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class OpcionalesSectionDto {
  @ValidateNested()
  @Type(() => DireccionDto)
  @IsOptional()
  direccion?: DireccionDto;

  @IsBoolean()
  @IsOptional()
  cierreCentral?: boolean;

  @IsBoolean()
  @IsOptional()
  alarma?: boolean;

  @IsEnum(['si', 'no', ''])
  @IsOptional()
  alarmaFunciona?: string;

  @IsEnum(['4', '5', ''])
  @IsOptional()
  cinturonesSeguridad?: string;

  @IsBoolean()
  @IsOptional()
  levVidElectricos?: boolean;

  @IsBoolean()
  @IsOptional()
  soloDelanteros?: boolean;

  @IsBoolean()
  @IsOptional()
  cuatroPuertas?: boolean;

  @IsEnum(['si', 'no', ''])
  @IsOptional()
  ventanasFuncionan?: string;

  @IsBoolean()
  @IsOptional()
  aireAcondicionado?: boolean;

  @IsBoolean()
  @IsOptional()
  climatizadorAut?: boolean;

  @IsBoolean()
  @IsOptional()
  bizona?: boolean;

  @IsEnum(['si', 'no', ''])
  @IsOptional()
  climaFunciona?: string;

  @IsString()
  @IsOptional()
  airBagCantidad?: string;

  @IsBoolean()
  @IsOptional()
  abs?: boolean;

  @IsBoolean()
  @IsOptional()
  asr?: boolean;

  @IsBoolean()
  @IsOptional()
  esp?: boolean;

  @IsBoolean()
  @IsOptional()
  ebd?: boolean;

  @IsBoolean()
  @IsOptional()
  afu?: boolean;

  @IsString()
  @IsOptional()
  gncCantidad?: string;

  @IsBoolean()
  @IsOptional()
  techoCorredizo?: boolean;

  @IsBoolean()
  @IsOptional()
  espejosElectricos?: boolean;

  @IsString()
  @IsOptional()
  llantasAleacion?: string;

  @IsEnum(['tambor', 'dos_tambor_dos_disco', 'discos_cuatro_ruedas', ''])
  @IsOptional()
  frenos?: string;
}

export class EquipamientoSectionDto {
  @IsBoolean()
  @IsOptional()
  auxilio?: boolean;

  @IsBoolean()
  @IsOptional()
  bulonesTuercasAntirrobo?: boolean;

  @IsBoolean()
  @IsOptional()
  gato?: boolean;

  @IsEnum(['4', '6', '5', ''])
  @IsOptional()
  cubreAlfombras?: string;

  @IsBoolean()
  @IsOptional()
  apoyacabezas?: boolean;

  @IsBoolean()
  @IsOptional()
  manualFabricante?: boolean;

  @IsBoolean()
  @IsOptional()
  llaveDuplicado?: boolean;

  @IsBoolean()
  @IsOptional()
  tarjetaArranque?: boolean;
}

export class CarroceriaSectionDto {
  @IsBoolean()
  @IsOptional()
  sedanCuatroPuertas?: boolean;

  @IsBoolean()
  @IsOptional()
  hatchbackCincoPuertas?: boolean;

  @IsBoolean()
  @IsOptional()
  hatchbackTresPuertas?: boolean;

  @IsBoolean()
  @IsOptional()
  monovolumen?: boolean;

  @IsBoolean()
  @IsOptional()
  furgonChico?: boolean;

  @IsBoolean()
  @IsOptional()
  furgonGrande?: boolean;

  @IsBoolean()
  @IsOptional()
  pickupChica?: boolean;

  @IsBoolean()
  @IsOptional()
  pickupMediana?: boolean;

  @IsBoolean()
  @IsOptional()
  miniBus?: boolean;

  @IsBoolean()
  @IsOptional()
  coupeDeportiva?: boolean;

  @IsBoolean()
  @IsOptional()
  motocicleta?: boolean;

  @IsString()
  @IsOptional()
  motocicletaCilindrada?: string;
}

export class MotorSectionDto {
  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  cilindrada?: string;

  @IsString()
  @IsOptional()
  cilindradaKms?: string;

  @IsEnum(['delantera', 'trasera', ''])
  @IsOptional()
  ubicacion?: string;

  @IsBoolean()
  @IsOptional()
  longitudinal?: boolean;

  @IsBoolean()
  @IsOptional()
  transversal?: boolean;

  @IsString()
  @IsOptional()
  hp?: string;

  @IsEnum(['3', '4', '5', '6', '8', ''])
  @IsOptional()
  numeroCilindros?: string;

  @IsEnum(['v', 'linea', 'boxer', ''])
  @IsOptional()
  disposicion?: string;

  @IsEnum(['naftero', 'diesel', ''])
  @IsOptional()
  combustible?: string;

  @IsBoolean()
  @IsOptional()
  inyeccionElectronica?: boolean;

  @IsBoolean()
  @IsOptional()
  commonRail?: boolean;

  @IsEnum(['turbo', 'biturbo', ''])
  @IsOptional()
  aspirado?: string;

  @IsString()
  @IsOptional()
  aceiteMarca?: string;

  @IsEnum(['f10', 'f15', ''])
  @IsOptional()
  viscosidad?: string;

  @IsString()
  @IsOptional()
  aceiteKms?: string;

  @IsBoolean()
  @IsOptional()
  aceiteOtro?: boolean;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class NeumaticoConditionDto {
  @IsEnum([
    'delantero_derecho',
    'delantero_izquierdo',
    'trasero_derecho',
    'trasero_izquierdo',
    'auxilio',
  ])
  posicion: string;

  @IsEnum(['n', 'b', 'r', 'm'])
  condicion: string;
}

export class NeumaticosSectionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NeumaticoConditionDto)
  @IsOptional()
  neumaticos?: NeumaticoConditionDto[];

  @IsEnum(['n', 'b', 'r', 'o', ''])
  @IsOptional()
  auxilioCondicion?: string;
}

export class PuntajeSectionDto {
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  puntaje?: number;
}

export class DanoChapaPinturaDto {
  @IsEnum(['b', 'r', 'o', 'c', 'q', 'm', 'p', 'e', 'rpp', 'k'])
  tipo: string;

  @IsString()
  posicion: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class ChapaPinturaSectionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DanoChapaPinturaDto)
  @IsOptional()
  danos?: DanoChapaPinturaDto[];
}

export class PeritajeMecanicoDto {
  @ValidateNested()
  @Type(() => InspectionHeaderDto)
  @IsOptional()
  header?: InspectionHeaderDto;

  @ValidateNested()
  @Type(() => StereoSectionDto)
  @IsOptional()
  stereo?: StereoSectionDto;

  @ValidateNested()
  @Type(() => TransmisionSectionDto)
  @IsOptional()
  transmision?: TransmisionSectionDto;

  @ValidateNested()
  @Type(() => OpcionalesSectionDto)
  @IsOptional()
  opcionales?: OpcionalesSectionDto;

  @ValidateNested()
  @Type(() => EquipamientoSectionDto)
  @IsOptional()
  equipamiento?: EquipamientoSectionDto;

  @ValidateNested()
  @Type(() => CarroceriaSectionDto)
  @IsOptional()
  carroceria?: CarroceriaSectionDto;

  @ValidateNested()
  @Type(() => MotorSectionDto)
  @IsOptional()
  motor?: MotorSectionDto;

  @ValidateNested()
  @Type(() => NeumaticosSectionDto)
  @IsOptional()
  neumaticos?: NeumaticosSectionDto;

  @ValidateNested()
  @Type(() => PuntajeSectionDto)
  @IsOptional()
  puntaje?: PuntajeSectionDto;

  @ValidateNested()
  @Type(() => ChapaPinturaSectionDto)
  @IsOptional()
  chapaPintura?: ChapaPinturaSectionDto;
}

export class ChecklistItemDto {
  @IsString()
  item: string;

  @IsBoolean()
  @IsOptional()
  ok?: boolean;

  @IsString()
  @IsOptional()
  comentario?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precio?: number;
}

export class ChecklistGeneralDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  @IsOptional()
  items?: ChecklistItemDto[];

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorReacondicionado?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorReparacion?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorToma?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  total?: number;
}

export class TrenComponentDto {
  @IsString()
  repuesto: string;

  @IsBoolean()
  @IsOptional()
  ok?: boolean;

  @IsBoolean()
  @IsOptional()
  no?: boolean;

  @IsString()
  @IsOptional()
  detalle?: string;
}

export class ControlTrenDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrenComponentDto)
  @IsOptional()
  trenDelantero?: TrenComponentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrenComponentDto)
  @IsOptional()
  trenTrasero?: TrenComponentDto[];
}

export class FrenoComponentDto {
  @IsString()
  componente: string;

  @IsBoolean()
  @IsOptional()
  ok?: boolean;

  @IsString()
  @IsOptional()
  comentario?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precio?: number;
}

export class DamageMarkDto {
  @IsEnum(['0', 'x', '#', 'z'])
  tipo: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class SistemaFrenosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FrenoComponentDto)
  @IsOptional()
  componentes?: FrenoComponentDto[];
}

export class DanosDiagramaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DamageMarkDto)
  @IsOptional()
  front?: DamageMarkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DamageMarkDto)
  @IsOptional()
  rear?: DamageMarkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DamageMarkDto)
  @IsOptional()
  sideDriver?: DamageMarkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DamageMarkDto)
  @IsOptional()
  side?: DamageMarkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DamageMarkDto)
  @IsOptional()
  top?: DamageMarkDto[];
}

export class InspectionDataDto {
  @ValidateNested()
  @Type(() => PeritajeMecanicoDto)
  @IsOptional()
  mecanico?: PeritajeMecanicoDto;

  @ValidateNested()
  @Type(() => ChecklistGeneralDto)
  @IsOptional()
  checklist?: ChecklistGeneralDto;

  @ValidateNested()
  @Type(() => ControlTrenDto)
  @IsOptional()
  tren?: ControlTrenDto;

  @ValidateNested()
  @Type(() => SistemaFrenosDto)
  @IsOptional()
  frenos?: SistemaFrenosDto;

  @ValidateNested()
  @Type(() => DanosDiagramaDto)
  @IsOptional()
  danosDiagrama?: DanosDiagramaDto;
}

