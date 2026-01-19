import { useState, useEffect, ChangeEvent } from 'react'
import type { PeritajeMecanico } from '../utils/inspectionDataSchema'
import Input from '../../../../components/common/Input'
import TireDiagram from './TireDiagram'

interface Props {
  data: PeritajeMecanico
  onChange: (data: PeritajeMecanico) => void
  vehicleData?: {
    brand?: string
    model?: string
    year?: number
    color?: string
    licensePlate?: string
    kilometers?: number
  }
}

export default function PeritajeMecanicoTab({ data, onChange, vehicleData }: Props) {
  const [localData, setLocalData] = useState<PeritajeMecanico>(data)

  useEffect(() => {
    setLocalData(data)
  }, [data])

  useEffect(() => {
    onChange(localData)
  }, [localData, onChange])

  // Auto-fill header when vehicle is selected
  useEffect(() => {
    if (vehicleData) {
      setLocalData((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          marca: vehicleData.brand || prev.header.marca,
          modelo: vehicleData.model || prev.header.modelo,
          año: vehicleData.year || prev.header.año,
          color: vehicleData.color || prev.header.color,
          dominio: vehicleData.licensePlate || prev.header.dominio,
          kilometraje: vehicleData.kilometers || prev.header.kilometraje,
        },
      }))
    }
  }, [vehicleData])

  const updateHeader = (field: keyof PeritajeMecanico['header'], value: any) => {
    setLocalData((prev) => ({
      ...prev,
      header: { ...prev.header, [field]: value },
    }))
  }

  const handleDominioChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Solo permitir letras y números, convertir a mayúsculas
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    updateHeader('dominio', value)
  }

  const updateStereo = (field: keyof PeritajeMecanico['stereo'], value: any) => {
    setLocalData((prev) => ({
      ...prev,
      stereo: { ...prev.stereo, [field]: value },
    }))
  }

  const updateTransmision = (field: keyof PeritajeMecanico['transmision'], value: any) => {
    setLocalData((prev) => ({
      ...prev,
      transmision: { ...prev.transmision, [field]: value },
    }))
  }

  const updateOpcionales = (field: keyof PeritajeMecanico['opcionales'], value: any) => {
    setLocalData((prev) => ({
      ...prev,
      opcionales: { ...prev.opcionales, [field]: value },
    }))
  }

  const updateOpcionalesDireccion = (field: string, value: any) => {
    setLocalData((prev) => ({
      ...prev,
      opcionales: {
        ...prev.opcionales,
        direccion: { ...prev.opcionales.direccion, [field]: value },
      },
    }))
  }

  const updateEquipamiento = (field: keyof PeritajeMecanico['equipamiento'], value: any) => {
    setLocalData((prev) => ({
      ...prev,
      equipamiento: { ...prev.equipamiento, [field]: value },
    }))
  }

  const updateCarroceria = (field: keyof PeritajeMecanico['carroceria'], value: any) => {
    setLocalData((prev) => ({
      ...prev,
      carroceria: { ...prev.carroceria, [field]: value },
    }))
  }

  const updateMotor = (field: keyof PeritajeMecanico['motor'], value: any) => {
    setLocalData((prev) => ({
      ...prev,
      motor: { ...prev.motor, [field]: value },
    }))
  }

  const updateNeumaticos = (field: keyof PeritajeMecanico['neumaticos'], value: any) => {
    setLocalData((prev) => ({
      ...prev,
      neumaticos: { ...prev.neumaticos, [field]: value },
    }))
  }

  const updatePuntaje = (value: number) => {
    setLocalData((prev) => ({
      ...prev,
      puntaje: { puntaje: value },
    }))
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">PERITAJE MECÁNICO</h2>
      </div>

      {/* Header Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
        <Input
          label="FECHA"
          type="date"
          value={localData.header.fecha || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeader('fecha', e.target.value)}
        />
        <Input
          label="KILOMETRAJE"
          type="number"
          value={localData.header.kilometraje || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeader('kilometraje', parseInt(e.target.value) || 0)}
        />
        <Input
          label="PROPIETARIO"
          value={localData.header.propietario}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeader('propietario', e.target.value)}
        />
        <Input
          label="TITULAR REGISTRAL"
          value={localData.header.titularRegistral}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeader('titularRegistral', e.target.value)}
        />
        <Input
          label="DOMINIO"
          value={localData.header.dominio}
          onChange={handleDominioChange}
          placeholder="ABC123"
          pattern="[A-Z0-9]*"
          title="Solo letras y números"
        />
        <Input
          label="MARCA"
          value={localData.header.marca}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeader('marca', e.target.value)}
        />
        <Input
          label="MODELO"
          value={localData.header.modelo}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeader('modelo', e.target.value)}
        />
        <Input
          label="AÑO"
          type="number"
          value={localData.header.año || ''}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeader('año', parseInt(e.target.value) || 0)}
        />
        <Input
          label="COLOR"
          value={localData.header.color}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeader('color', e.target.value)}
        />
        <Input
          label="TITULAR PLAN"
          value={localData.header.titularPlan}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeader('titularPlan', e.target.value)}
        />
        <Input
          label="Nº SUSCRIPCIÓN"
          value={localData.header.numeroSuscripcion}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateHeader('numeroSuscripcion', e.target.value)}
        />
      </div>

      {/* Main Sections - Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-4">
          {/* STEREO */}
          <div className="border p-3 print:border-black">
            <h3 className="font-bold mb-2">STEREO</h3>
            <Input
              label="Marca"
              value={localData.stereo.marca}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('marca', e.target.value)}
            />
            <div className="space-y-1 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.stereo.radioPc || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('radioPc', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Radio/PC</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.stereo.radioCd || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('radioCd', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Radio/CD</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.stereo.mp3 || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('mp3', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">MP3</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.stereo.usb || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('usb', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">USB</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.stereo.bluetooth || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('bluetooth', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Bluetooth</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.stereo.aux || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('aux', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Aux.</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.stereo.ipod || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('ipod', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Ipod</span>
              </label>
            </div>
            <Input
              label="Pantalla/pulg."
              value={localData.stereo.pantallaPulgadas}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('pantallaPulgadas', e.target.value)}
              className="mt-2"
            />
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Extraible</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="extraible"
                    value="si"
                    checked={localData.stereo.extraible === 'si'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('extraible', e.target.value)}
                  />
                  <span className="text-sm">Si</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="extraible"
                    value="no"
                    checked={localData.stereo.extraible === 'no'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('extraible', e.target.value)}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Lo trajo</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="loTrajo"
                    value="si"
                    checked={localData.stereo.loTrajo === 'si'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('loTrajo', e.target.value)}
                  />
                  <span className="text-sm">Si</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="loTrajo"
                    value="no"
                    checked={localData.stereo.loTrajo === 'no'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateStereo('loTrajo', e.target.value)}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>
          </div>

          {/* EQUIPAMIENTO */}
          <div className="border p-3 print:border-black">
            <h3 className="font-bold mb-2">EQUIPAMIENTO</h3>
            <div className="space-y-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.equipamiento.auxilio || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateEquipamiento('auxilio', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Auxilio</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.equipamiento.bulonesTuercasAntirrobo || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateEquipamiento('bulonesTuercasAntirrobo', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Bulones/Tuercas Antirrobo</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.equipamiento.gato || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateEquipamiento('gato', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Gato</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={!!localData.equipamiento.cubreAlfombras}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (!e.target.checked) {
                        updateEquipamiento('cubreAlfombras', '')
                      }
                    }}
                    className="checkbox"
                  />
                  <span className="text-sm">Cubre alfombras/cant.</span>
                </label>
                {localData.equipamiento.cubreAlfombras && (
                  <div className="flex gap-2">
                    {['4', '6', '5'].map((val) => (
                      <label key={val} className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="cubreAlfombras"
                          value={val}
                          checked={localData.equipamiento.cubreAlfombras === val}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => updateEquipamiento('cubreAlfombras', e.target.value)}
                        />
                        <span className="text-sm">{val}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.equipamiento.apoyacabezas || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateEquipamiento('apoyacabezas', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Apoyacabezas</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.equipamiento.manualFabricante || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateEquipamiento('manualFabricante', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Manual del fabricante</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.equipamiento.llaveDuplicado || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateEquipamiento('llaveDuplicado', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Llave duplicado</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.equipamiento.tarjetaArranque || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateEquipamiento('tarjetaArranque', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Tarjeta arranque</span>
              </label>
            </div>
          </div>

          {/* MOTOR */}
          <div className="border p-3 print:border-black">
            <h3 className="font-bold mb-2">MOTOR</h3>
            <Input
              label="Marca"
              value={localData.motor.marca}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('marca', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                label="Cilindrada"
                value={localData.motor.cilindrada}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('cilindrada', e.target.value)}
              />
              <Input
                label="Kms"
                value={localData.motor.cilindradaKms}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('cilindradaKms', e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Ubicación</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="ubicacion"
                    value="delantera"
                    checked={localData.motor.ubicacion === 'delantera'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('ubicacion', e.target.value)}
                  />
                  <span className="text-sm">Delantera</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="ubicacion"
                    value="trasera"
                    checked={localData.motor.ubicacion === 'trasera'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('ubicacion', e.target.value)}
                  />
                  <span className="text-sm">Trasera</span>
                </label>
              </div>
            </div>
            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.motor.longitudinal || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('longitudinal', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Long.</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.motor.transversal || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('transversal', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Transv.</span>
              </label>
            </div>
            <Input
              label="HP"
              value={localData.motor.hp}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('hp', e.target.value)}
              className="mt-2"
            />
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Nº Cilindros</label>
              <div className="flex gap-2 flex-wrap">
                {['3', '4', '5', '6', '8'].map((val) => (
                  <label key={val} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="numeroCilindros"
                      value={val}
                      checked={localData.motor.numeroCilindros === val}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('numeroCilindros', e.target.value)}
                    />
                    <span className="text-sm">{val}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Disposición</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="disposicion"
                    value="v"
                    checked={localData.motor.disposicion === 'v'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('disposicion', e.target.value)}
                  />
                  <span className="text-sm">en V</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="disposicion"
                    value="linea"
                    checked={localData.motor.disposicion === 'linea'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('disposicion', e.target.value)}
                  />
                  <span className="text-sm">en línea</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="disposicion"
                    value="boxer"
                    checked={localData.motor.disposicion === 'boxer'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('disposicion', e.target.value)}
                  />
                  <span className="text-sm">Boxer</span>
                </label>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Combustible</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="combustible"
                    value="naftero"
                    checked={localData.motor.combustible === 'naftero'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('combustible', e.target.value)}
                  />
                  <span className="text-sm">Naftero</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="combustible"
                    value="diesel"
                    checked={localData.motor.combustible === 'diesel'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('combustible', e.target.value)}
                  />
                  <span className="text-sm">Diesel</span>
                </label>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.motor.inyeccionElectronica || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('inyeccionElectronica', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Inyecc. Electr.</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.motor.commonRail || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('commonRail', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Common-rail</span>
              </label>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Aspirado</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="aspirado"
                    value="turbo"
                    checked={localData.motor.aspirado === 'turbo'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('aspirado', e.target.value)}
                  />
                  <span className="text-sm">Turbo</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="aspirado"
                    value="biturbo"
                    checked={localData.motor.aspirado === 'biturbo'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('aspirado', e.target.value)}
                  />
                  <span className="text-sm">Biturbo</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Input
                label="Aceite Marca"
                value={localData.motor.aceiteMarca}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('aceiteMarca', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium mb-1">Viscocidad</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="viscocidad"
                      value="f10"
                      checked={localData.motor.viscosidad === 'f10'}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('viscosidad', e.target.value)}
                    />
                    <span className="text-sm">F10</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="viscocidad"
                      value="f15"
                      checked={localData.motor.viscosidad === 'f15'}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('viscosidad', e.target.value)}
                    />
                    <span className="text-sm">F15</span>
                  </label>
                </div>
              </div>
            </div>
            <Input
              label="Kms"
              value={localData.motor.aceiteKms}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('aceiteKms', e.target.value)}
              className="mt-2"
            />
            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.motor.aceiteOtro || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateMotor('aceiteOtro', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Otro</span>
              </label>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Obs.</label>
              <textarea
                value={localData.motor.observaciones}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateMotor('observaciones', e.target.value)}
                className="input"
                rows={2}
                placeholder="Observaciones"
              />
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="space-y-4">
          {/* CAJA TRANSMISIÓN */}
          <div className="border p-3 print:border-black">
            <h3 className="font-bold mb-2">CAJA TRANSMISIÓN</h3>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={localData.transmision.cajaManual || false}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateTransmision('cajaManual', e.target.checked)}
                className="checkbox"
              />
              <span className="text-sm">Caja manual</span>
            </label>
            <div className="space-y-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.transmision.tresCuatroMarchas || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateTransmision('tresCuatroMarchas', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">3 ó 4 marchas</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.transmision.mt5 || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateTransmision('mt5', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">MT 5</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.transmision.mt6 || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateTransmision('mt6', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">MT6</span>
              </label>
            </div>
            <Input
              label="AT Nº marchas"
              value={localData.transmision.atNumeroMarchas}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateTransmision('atNumeroMarchas', e.target.value)}
              className="mt-2"
            />
            <Input
              label="Marca"
              value={localData.transmision.marca}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateTransmision('marca', e.target.value)}
              className="mt-2"
            />
          </div>

          {/* NEUMÁTICOS */}
          <TireDiagram
            neumaticos={localData.neumaticos.neumaticos}
            auxilioCondicion={localData.neumaticos.auxilioCondicion}
            onUpdate={(newNeumaticos, newAuxilio) => {
              updateNeumaticos('neumaticos', newNeumaticos)
              updateNeumaticos('auxilioCondicion', newAuxilio)
            }}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* OPCIONALES */}
          <div className="border p-3 print:border-black">
            <h3 className="font-bold mb-2">OPCIONALES</h3>
            <div>
              <label className="block text-sm font-medium mb-1">DIRECCIÓN</label>
              <div className="flex gap-2 mb-1">
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={localData.opcionales.direccion.hidraulica || false}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionalesDireccion('hidraulica', e.target.checked)}
                    className="checkbox"
                  />
                  <span className="text-sm">Hidráulica</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={localData.opcionales.direccion.electrica || false}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionalesDireccion('electrica', e.target.checked)}
                    className="checkbox"
                  />
                  <span className="text-sm">Eléctrica</span>
                </label>
              </div>
              <Input
                label="Obs."
                value={localData.opcionales.direccion.observaciones}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionalesDireccion('observaciones', e.target.value)}
              />
            </div>
            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.opcionales.cierreCentral || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('cierreCentral', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Cierre central</span>
              </label>
            </div>
            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.opcionales.alarma || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('alarma', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Alarma</span>
              </label>
              <div className="flex gap-4 mt-1 ml-6">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="alarmaFunciona"
                    value="si"
                    checked={localData.opcionales.alarmaFunciona === 'si'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('alarmaFunciona', e.target.value)}
                  />
                  <span className="text-sm">FUNCIONA: Si</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="alarmaFunciona"
                    value="no"
                    checked={localData.opcionales.alarmaFunciona === 'no'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('alarmaFunciona', e.target.value)}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Cinturones/seg.</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="cinturonesSeguridad"
                    value="4"
                    checked={localData.opcionales.cinturonesSeguridad === '4'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('cinturonesSeguridad', e.target.value)}
                  />
                  <span className="text-sm">4</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="cinturonesSeguridad"
                    value="5"
                    checked={localData.opcionales.cinturonesSeguridad === '5'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('cinturonesSeguridad', e.target.value)}
                  />
                  <span className="text-sm">5</span>
                </label>
              </div>
            </div>
            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.opcionales.levVidElectricos || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('levVidElectricos', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Lev/vid. eléctricos</span>
              </label>
              <label className="flex items-center gap-2 ml-6">
                <input
                  type="checkbox"
                  checked={localData.opcionales.soloDelanteros || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('soloDelanteros', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Sólo Delanteros</span>
              </label>
              <label className="flex items-center gap-2 ml-6">
                <input
                  type="checkbox"
                  checked={localData.opcionales.cuatroPuertas || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('cuatroPuertas', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">4 puertas</span>
              </label>
              <div className="flex gap-4 mt-1 ml-6">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="ventanasFuncionan"
                    value="si"
                    checked={localData.opcionales.ventanasFuncionan === 'si'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('ventanasFuncionan', e.target.value)}
                  />
                  <span className="text-sm">FUNCIONAN: Si</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="ventanasFuncionan"
                    value="no"
                    checked={localData.opcionales.ventanasFuncionan === 'no'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('ventanasFuncionan', e.target.value)}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>
            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.opcionales.aireAcondicionado || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('aireAcondicionado', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Aire acondicionado</span>
              </label>
              <label className="flex items-center gap-2 ml-6">
                <input
                  type="checkbox"
                  checked={localData.opcionales.climatizadorAut || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('climatizadorAut', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Climatizador aut.</span>
              </label>
              <label className="flex items-center gap-2 ml-6">
                <input
                  type="checkbox"
                  checked={localData.opcionales.bizona || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('bizona', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Bizona</span>
              </label>
              <div className="flex gap-4 mt-1 ml-6">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="climaFunciona"
                    value="si"
                    checked={localData.opcionales.climaFunciona === 'si'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('climaFunciona', e.target.value)}
                  />
                  <span className="text-sm">FUNCIONA: Si</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="climaFunciona"
                    value="no"
                    checked={localData.opcionales.climaFunciona === 'no'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('climaFunciona', e.target.value)}
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
            </div>
            <Input
              label="Air bag/cantidad"
              value={localData.opcionales.airBagCantidad}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('airBagCantidad', e.target.value)}
              className="mt-2"
            />
            <div className="mt-2 flex gap-2 flex-wrap">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={localData.opcionales.abs || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('abs', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">ABS</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={localData.opcionales.asr || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('asr', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">ASR</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={localData.opcionales.esp || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('esp', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">ESP</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={localData.opcionales.ebd || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('ebd', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">EBD</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={localData.opcionales.afu || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('afu', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">AFU</span>
              </label>
            </div>
            <Input
              label="GNC/cant.m³"
              value={localData.opcionales.gncCantidad}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('gncCantidad', e.target.value)}
              className="mt-2"
            />
            <div className="mt-2 space-y-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.opcionales.techoCorredizo || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('techoCorredizo', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Techo corredizo</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localData.opcionales.espejosElectricos || false}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('espejosElectricos', e.target.checked)}
                  className="checkbox"
                />
                <span className="text-sm">Espejos eléctricos</span>
              </label>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Llant. Aleación</label>
              <div className="flex items-center gap-2">
                <Input
                  value={localData.opcionales.llantasAleacion}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('llantasAleacion', e.target.value)}
                />
                <span className="text-sm">pulgadas</span>
              </div>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium mb-1">Frenos</label>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="frenos"
                    value="tambor"
                    checked={localData.opcionales.frenos === 'tambor'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('frenos', e.target.value)}
                  />
                  <span className="text-sm">A tambor</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="frenos"
                    value="dos_tambor_dos_disco"
                    checked={localData.opcionales.frenos === 'dos_tambor_dos_disco'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('frenos', e.target.value)}
                  />
                  <span className="text-sm">2 a tambor y 2 a disco</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="frenos"
                    value="discos_cuatro_ruedas"
                    checked={localData.opcionales.frenos === 'discos_cuatro_ruedas'}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateOpcionales('frenos', e.target.value)}
                  />
                  <span className="text-sm">Discos en las 4 ruedas</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carrocería tipo - Full width */}
      <div className="border p-3 print:border-black">
        <h3 className="font-bold mb-2">Carrocería tipo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 print:grid-cols-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.carroceria.sedanCuatroPuertas || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('sedanCuatroPuertas', e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Sedán 4Ptas</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.carroceria.hatchbackCincoPuertas || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('hatchbackCincoPuertas', e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Hatchback 5Ptas</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.carroceria.hatchbackTresPuertas || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('hatchbackTresPuertas', e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">ó 3Ptas</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.carroceria.monovolumen || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('monovolumen', e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Monovolúmen</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.carroceria.furgonChico || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('furgonChico', e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Furgón chico</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.carroceria.furgonGrande || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('furgonGrande', e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Grande</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.carroceria.pickupChica || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('pickupChica', e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Pick-up chica</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.carroceria.pickupMediana || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('pickupMediana', e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Pick-up mediana</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.carroceria.miniBus || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('miniBus', e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Mini bus</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localData.carroceria.coupeDeportiva || false}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('coupeDeportiva', e.target.checked)}
              className="checkbox"
            />
            <span className="text-sm">Coupé deportiva</span>
          </label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localData.carroceria.motocicleta || false}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('motocicleta', e.target.checked)}
                className="checkbox"
              />
              <span className="text-sm">Motocicleta</span>
            </label>
            {localData.carroceria.motocicleta && (
              <Input
                value={localData.carroceria.motocicletaCilindrada}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateCarroceria('motocicletaCilindrada', e.target.value)}
                placeholder="cm³"
                className="w-24"
              />
            )}
          </div>
        </div>
      </div>

      {/* PUNTAJE */}
      <div className="border p-3 print:border-black">
        <h3 className="font-bold mb-2">PUNTAJE</h3>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <label key={num} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="puntaje"
                  value={num}
                  checked={localData.puntaje.puntaje === num}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updatePuntaje(parseInt(e.target.value))}
                />
                <span className="text-sm font-bold">{num}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Chapa y pintura */}
      <div className="border p-3 print:border-black">
        <h3 className="font-bold mb-2">Chapa y pintura</h3>
        <div className="text-xs mb-2 p-2 bg-gray-100 border border-gray-300 print:bg-gray-50">
          <p>
            <strong>B = BOLLO</strong> | <strong>R = RAYA</strong> | <strong>O = CORROCIÓN</strong> |{' '}
            <strong>C = CHOQUE</strong> | <strong>Q = CUARTEADO</strong> | <strong>M = MICROBOLLO</strong> |{' '}
            <strong>P = PIEDRA</strong> | <strong>E = REEMPLAZO</strong> | <strong>RPP = REPINTADO PARCIAL</strong> |{' '}
            <strong>K = CHAPA PICADA</strong>
          </p>
        </div>
        <div className="space-y-2">
          {localData.chapaPintura.danos.map((dano, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <select
                value={dano.tipo}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                  const newDanos = [...localData.chapaPintura.danos]
                  newDanos[idx] = { ...dano, tipo: e.target.value as any }
                  setLocalData((prev) => ({
                    ...prev,
                    chapaPintura: { danos: newDanos },
                  }))
                }}
                className="input"
              >
                <option value="b">B - BOLLO</option>
                <option value="r">R - RAYA</option>
                <option value="o">O - CORROCIÓN</option>
                <option value="c">C - CHOQUE</option>
                <option value="q">Q - CUARTEADO</option>
                <option value="m">M - MICROBOLLO</option>
                <option value="p">P - PIEDRA</option>
                <option value="e">E - REEMPLAZO</option>
                <option value="rpp">RPP - REPINTADO PARCIAL</option>
                <option value="k">K - CHAPA PICADA</option>
              </select>
              <Input
                value={dano.posicion}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newDanos = [...localData.chapaPintura.danos]
                  newDanos[idx] = { ...dano, posicion: e.target.value }
                  setLocalData((prev) => ({
                    ...prev,
                    chapaPintura: { danos: newDanos },
                  }))
                }}
                placeholder="Posición"
              />
              <Input
                value={dano.descripcion || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const newDanos = [...localData.chapaPintura.danos]
                  newDanos[idx] = { ...dano, descripcion: e.target.value }
                  setLocalData((prev) => ({
                    ...prev,
                    chapaPintura: { danos: newDanos },
                  }))
                }}
                placeholder="Descripción"
              />
              <button
                type="button"
                onClick={() => {
                  const newDanos = localData.chapaPintura.danos.filter((_, i) => i !== idx)
                  setLocalData((prev) => ({
                    ...prev,
                    chapaPintura: { danos: newDanos },
                  }))
                }}
                className="btn btn-danger btn-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setLocalData((prev) => ({
                ...prev,
                chapaPintura: {
                  danos: [...prev.chapaPintura.danos, { tipo: 'b', posicion: '', descripcion: '' }],
                },
              }))
            }}
            className="btn btn-secondary btn-sm"
          >
            Agregar Daño
          </button>
        </div>
      </div>
    </div>
  )
}

