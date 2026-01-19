// Complete data structure for vehicle inspections

export interface InspectionHeader {
  fecha: string
  kilometraje: number
  propietario: string
  titularRegistral: string
  dominio: string
  marca: string
  modelo: string
  año: number
  color: string
  titularPlan: string
  numeroSuscripcion: string
}

export interface StereoSection {
  marca: string
  radioPc: boolean
  radioCd: boolean
  mp3: boolean
  usb: boolean
  bluetooth: boolean
  aux: boolean
  ipod: boolean
  pantallaPulgadas: string
  extraible: 'si' | 'no' | ''
  loTrajo: 'si' | 'no' | ''
}

export interface TransmisionSection {
  cajaManual: boolean
  tresCuatroMarchas: boolean
  mt5: boolean
  mt6: boolean
  atNumeroMarchas: string
  marca: string
}

export interface OpcionalesSection {
  direccion: {
    hidraulica: boolean
    electrica: boolean
    observaciones: string
  }
  cierreCentral: boolean
  alarma: boolean
  alarmaFunciona: 'si' | 'no' | ''
  cinturonesSeguridad: '4' | '5' | ''
  levVidElectricos: boolean
  soloDelanteros: boolean
  cuatroPuertas: boolean
  ventanasFuncionan: 'si' | 'no' | ''
  aireAcondicionado: boolean
  climatizadorAut: boolean
  bizona: boolean
  climaFunciona: 'si' | 'no' | ''
  airBagCantidad: string
  abs: boolean
  asr: boolean
  esp: boolean
  ebd: boolean
  afu: boolean
  gncCantidad: string
  techoCorredizo: boolean
  espejosElectricos: boolean
  llantasAleacion: string
  frenos: 'tambor' | 'dos_tambor_dos_disco' | 'discos_cuatro_ruedas' | ''
}

export interface EquipamientoSection {
  auxilio: boolean
  bulonesTuercasAntirrobo: boolean
  gato: boolean
  cubreAlfombras: '4' | '6' | '5' | ''
  apoyacabezas: boolean
  manualFabricante: boolean
  llaveDuplicado: boolean
  tarjetaArranque: boolean
}

export interface CarroceriaSection {
  sedanCuatroPuertas: boolean
  hatchbackCincoPuertas: boolean
  hatchbackTresPuertas: boolean
  monovolumen: boolean
  furgonChico: boolean
  furgonGrande: boolean
  pickupChica: boolean
  pickupMediana: boolean
  miniBus: boolean
  coupeDeportiva: boolean
  motocicleta: boolean
  motocicletaCilindrada: string
}

export interface MotorSection {
  marca: string
  cilindrada: string
  cilindradaKms: string
  ubicacion: 'delantera' | 'trasera' | ''
  longitudinal: boolean
  transversal: boolean
  hp: string
  numeroCilindros: '3' | '4' | '5' | '6' | '8' | ''
  disposicion: 'v' | 'linea' | 'boxer' | ''
  combustible: 'naftero' | 'diesel' | ''
  inyeccionElectronica: boolean
  commonRail: boolean
  aspirado: 'turbo' | 'biturbo' | ''
  aceiteMarca: string
  viscosidad: 'f10' | 'f15' | ''
  aceiteKms: string
  aceiteOtro: boolean
  observaciones: string
}

export interface NeumaticoCondition {
  posicion: 'delantero_derecho' | 'delantero_izquierdo' | 'trasero_derecho' | 'trasero_izquierdo' | 'auxilio'
  condicion: 'n' | 'b' | 'r' | 'm' // Nuevo, Bueno, Regular, Malo
}

export interface NeumaticosSection {
  neumaticos: NeumaticoCondition[]
  auxilioCondicion: 'n' | 'b' | 'r' | 'o' | ''
}

export interface PuntajeSection {
  puntaje: number // 1-10
}

export interface ChapaPinturaSection {
  danos: Array<{
    tipo: 'b' | 'r' | 'o' | 'c' | 'q' | 'm' | 'p' | 'e' | 'rpp' | 'k' // Ver leyenda
    posicion: string
    descripcion: string
  }>
}

export interface PeritajeMecanico {
  header: InspectionHeader
  stereo: StereoSection
  transmision: TransmisionSection
  opcionales: OpcionalesSection
  equipamiento: EquipamientoSection
  carroceria: CarroceriaSection
  motor: MotorSection
  neumaticos: NeumaticosSection
  puntaje: PuntajeSection
  chapaPintura: ChapaPinturaSection
}

export interface ChecklistItem {
  item: string
  ok: boolean
  comentario: string
  precio: number
}

export interface ChecklistGeneral {
  items: ChecklistItem[]
  observaciones: string
  valorReacondicionado: number
  valorReparacion: number
  valorToma: number
  total: number
}

export interface TrenComponent {
  repuesto: string
  ok: boolean
  no: boolean
  detalle: string
}

export interface ControlTren {
  trenDelantero: TrenComponent[]
  trenTrasero: TrenComponent[]
}

export interface FrenoComponent {
  componente: string
  ok: boolean
  comentario: string
  precio: number
}

export interface DamageMark {
  tipo: '0' | 'x' | '#' | 'z' // Daño chapa, pintura, cristal, ópticas
  x: number // Coordenada relativa en el diagrama
  y: number
  descripcion?: string
}

export interface SistemaFrenos {
  componentes: FrenoComponent[]
  danosDiagrama: DamageMark[]
}

export interface InspectionData {
  mecanico: PeritajeMecanico
  checklist: ChecklistGeneral
  tren: ControlTren
  frenos: SistemaFrenos
}

// Helper function to create empty inspection data
export function createEmptyInspectionData(): InspectionData {
  return {
    mecanico: {
      header: {
        fecha: '',
        kilometraje: 0,
        propietario: '',
        titularRegistral: '',
        dominio: '',
        marca: '',
        modelo: '',
        año: 0,
        color: '',
        titularPlan: '',
        numeroSuscripcion: '',
      },
      stereo: {
        marca: '',
        radioPc: false,
        radioCd: false,
        mp3: false,
        usb: false,
        bluetooth: false,
        aux: false,
        ipod: false,
        pantallaPulgadas: '',
        extraible: '',
        loTrajo: '',
      },
      transmision: {
        cajaManual: false,
        tresCuatroMarchas: false,
        mt5: false,
        mt6: false,
        atNumeroMarchas: '',
        marca: '',
      },
      opcionales: {
        direccion: {
          hidraulica: false,
          electrica: false,
          observaciones: '',
        },
        cierreCentral: false,
        alarma: false,
        alarmaFunciona: '',
        cinturonesSeguridad: '',
        levVidElectricos: false,
        soloDelanteros: false,
        cuatroPuertas: false,
        ventanasFuncionan: '',
        aireAcondicionado: false,
        climatizadorAut: false,
        bizona: false,
        climaFunciona: '',
        airBagCantidad: '',
        abs: false,
        asr: false,
        esp: false,
        ebd: false,
        afu: false,
        gncCantidad: '',
        techoCorredizo: false,
        espejosElectricos: false,
        llantasAleacion: '',
        frenos: '',
      },
      equipamiento: {
        auxilio: false,
        bulonesTuercasAntirrobo: false,
        gato: false,
        cubreAlfombras: '',
        apoyacabezas: false,
        manualFabricante: false,
        llaveDuplicado: false,
        tarjetaArranque: false,
      },
      carroceria: {
        sedanCuatroPuertas: false,
        hatchbackCincoPuertas: false,
        hatchbackTresPuertas: false,
        monovolumen: false,
        furgonChico: false,
        furgonGrande: false,
        pickupChica: false,
        pickupMediana: false,
        miniBus: false,
        coupeDeportiva: false,
        motocicleta: false,
        motocicletaCilindrada: '',
      },
      motor: {
        marca: '',
        cilindrada: '',
        cilindradaKms: '',
        ubicacion: '',
        longitudinal: false,
        transversal: false,
        hp: '',
        numeroCilindros: '',
        disposicion: '',
        combustible: '',
        inyeccionElectronica: false,
        commonRail: false,
        aspirado: '',
        aceiteMarca: '',
        viscosidad: '',
        aceiteKms: '',
        aceiteOtro: false,
        observaciones: '',
      },
      neumaticos: {
        neumaticos: [],
        auxilioCondicion: '',
      },
      puntaje: {
        puntaje: 0,
      },
      chapaPintura: {
        danos: [],
      },
    },
    checklist: {
      items: [
        { item: 'CHASIS', ok: false, comentario: '', precio: 0 },
        { item: 'MOTOR', ok: false, comentario: '', precio: 0 },
        { item: 'CAJA', ok: false, comentario: '', precio: 0 },
        { item: 'CH. Y PINT.', ok: false, comentario: '', precio: 0 },
        { item: 'PARAGOLPE', ok: false, comentario: '', precio: 0 },
        { item: 'GOMAS', ok: false, comentario: '', precio: 0 },
        { item: 'EMBRAGUE', ok: false, comentario: '', precio: 0 },
        { item: 'TREN DEL.', ok: false, comentario: '', precio: 0 },
        { item: 'TRANSMISIÓN', ok: false, comentario: '', precio: 0 },
        { item: 'CARDAN', ok: false, comentario: '', precio: 0 },
        { item: 'EJE TRASERO', ok: false, comentario: '', precio: 0 },
        { item: 'DIRECCIÓN', ok: false, comentario: '', precio: 0 },
        { item: 'FRENOS', ok: false, comentario: '', precio: 0 },
        { item: 'AMORT. DEL', ok: false, comentario: '', precio: 0 },
        { item: 'AMORT. TRAS.', ok: false, comentario: '', precio: 0 },
        { item: 'RADIADOR', ok: false, comentario: '', precio: 0 },
        { item: 'BATERÍA', ok: false, comentario: '', precio: 0 },
        { item: 'ANTENA', ok: false, comentario: '', precio: 0 },
        { item: 'ARRANQUE', ok: false, comentario: '', precio: 0 },
        { item: 'LIMPIAPARABRISA', ok: false, comentario: '', precio: 0 },
        { item: 'TAPIZADO', ok: false, comentario: '', precio: 0 },
        { item: 'ASIENTOS', ok: false, comentario: '', precio: 0 },
        { item: 'PARRILLA', ok: false, comentario: '', precio: 0 },
        { item: 'TABLERO', ok: false, comentario: '', precio: 0 },
        { item: 'CALEFACCIÓN', ok: false, comentario: '', precio: 0 },
        { item: 'AIRE ACONDICIONADO', ok: false, comentario: '', precio: 0 },
        { item: 'CORREA / CADENA DE DISTRIBUCIÓN', ok: false, comentario: '', precio: 0 },
        { item: 'LLANTAS', ok: false, comentario: '', precio: 0 },
        { item: 'VIDRIOS', ok: false, comentario: '', precio: 0 },
        { item: 'ESCAPE', ok: false, comentario: '', precio: 0 },
      ],
      observaciones: '',
      valorReacondicionado: 0,
      valorReparacion: 0,
      valorToma: 0,
      total: 0,
    },
    tren: {
      trenDelantero: [
        { repuesto: 'Amortiguador delantero derecho', ok: false, no: false, detalle: '' },
        { repuesto: 'Amortiguador delantero Izquierdo', ok: false, no: false, detalle: '' },
        { repuesto: 'Cazoleta derecha', ok: false, no: false, detalle: '' },
        { repuesto: 'Cazoleta izquierda', ok: false, no: false, detalle: '' },
        { repuesto: 'Parrila de suspensión derecha', ok: false, no: false, detalle: '' },
        { repuesto: 'Parrila de suspensión izquierda', ok: false, no: false, detalle: '' },
        { repuesto: 'Rótula derecha', ok: false, no: false, detalle: '' },
        { repuesto: 'Rótula izquierda', ok: false, no: false, detalle: '' },
        { repuesto: 'Axial derecho', ok: false, no: false, detalle: '' },
        { repuesto: 'Axial izquierdo', ok: false, no: false, detalle: '' },
        { repuesto: 'Extremo de dirección derecho', ok: false, no: false, detalle: '' },
        { repuesto: 'Extremo de dirección izquierdo', ok: false, no: false, detalle: '' },
        { repuesto: 'Bujes de barra estabilizadora', ok: false, no: false, detalle: '' },
        { repuesto: 'Bieletas de barra estabilizadora', ok: false, no: false, detalle: '' },
        { repuesto: 'Soporte de motor', ok: false, no: false, detalle: '' },
        { repuesto: 'Soporte de caja de cambios', ok: false, no: false, detalle: '' },
        { repuesto: 'Soporte de caja de dirección', ok: false, no: false, detalle: '' },
        { repuesto: 'Pastillas de freno delanteras', ok: false, no: false, detalle: '' },
        { repuesto: 'Discos de frenos delanteros', ok: false, no: false, detalle: '' },
        { repuesto: 'Junta homocinética derecha', ok: false, no: false, detalle: '' },
        { repuesto: 'Junta homocinética izquierda', ok: false, no: false, detalle: '' },
        { repuesto: 'Control general de fuelles', ok: false, no: false, detalle: '' },
      ],
      trenTrasero: [
        { repuesto: 'Amortiguador trasero derecho', ok: false, no: false, detalle: '' },
        { repuesto: 'Amortiguador trasero Izquierdo', ok: false, no: false, detalle: '' },
        { repuesto: 'Cazoleta derecha', ok: false, no: false, detalle: '' },
        { repuesto: 'Cazoleta izquierda', ok: false, no: false, detalle: '' },
        { repuesto: 'Bujes de barra estabilizadora', ok: false, no: false, detalle: '' },
        { repuesto: 'Bieletas de barra estabilizadora', ok: false, no: false, detalle: '' },
        { repuesto: 'Bujes tren trasero', ok: false, no: false, detalle: '' },
        { repuesto: 'Cintas de freno izquierda', ok: false, no: false, detalle: '' },
        { repuesto: 'Cintas de freno derecha', ok: false, no: false, detalle: '' },
        { repuesto: 'Campanas de freno izquierda', ok: false, no: false, detalle: '' },
        { repuesto: 'Campanas de freno derecha', ok: false, no: false, detalle: '' },
        { repuesto: 'Líquido de frenos', ok: false, no: false, detalle: '' },
      ],
    },
    frenos: {
      componentes: [
        { componente: 'Cintas de freno derecha', ok: false, comentario: '', precio: 0 },
        { componente: 'Cintas de freno izquierda', ok: false, comentario: '', precio: 0 },
        { componente: 'Campanas de freno izquierda', ok: false, comentario: '', precio: 0 },
        { componente: 'Campanas de freno derecha', ok: false, comentario: '', precio: 0 },
        { componente: 'Líquido de frenos', ok: false, comentario: '', precio: 0 },
      ],
      danosDiagrama: [],
    },
  }
}

