export interface KUBICInputs {
  areaLote: number;
  indiceOcupacion: number;
  indiceConstruccion: number;
  eficienciaPlanta: number;
  numSotanos: number;
  costoObraSobreM2: number;
  precioVentaM2: number;
  precioParqueaderoUnitario: number;
  numParqueaderos: number;
  pctCostosIndirectos: number;
  valorSueloPropuesto?: number;
  margenObjetivoPct: number;
}

export interface KUBICResults {
  areaOcupada: number;
  areaConstruibleSobre: number;
  areaVendible: number;
  areaSotanos: number;
  areaTotalObra: number;
  ventasArea: number;
  ventasParqueaderos: number;
  ventasTotales: number;
  costoDirectoSobre: number;
  costoDirectoBajo: number;
  costoDirectoTotal: number;
  costosIndirectos: number;
  gastosFinancieros: number;
  costoTotalObraSinTierra: number;
  residualSuelo: number;
  utilidadEstimada: number;
  margenObtenidoPct: number;
  estadoViabilidad: 'VERDE' | 'AMARILLO' | 'ROJO';
}

export function calcularPrefactibilidad(inputs: KUBICInputs): KUBICResults {
  const areaOcupada = inputs.areaLote * inputs.indiceOcupacion;
  const areaConstruibleSobre = inputs.areaLote * inputs.indiceConstruccion;
  const areaVendible = areaConstruibleSobre * (inputs.eficienciaPlanta / 100);
  const areaSotanos = areaOcupada * inputs.numSotanos;
  const areaTotalObra = areaConstruibleSobre + areaSotanos;

  const ventasArea = areaVendible * inputs.precioVentaM2;
  const ventasParqueaderos = inputs.numParqueaderos * inputs.precioParqueaderoUnitario;
  const ventasTotales = ventasArea + ventasParqueaderos;

  const costoDirectoSobre = areaConstruibleSobre * inputs.costoObraSobreM2;
  const costoDirectoBajo = areaSotanos * (inputs.costoObraSobreM2 * 1.2);
  const costoDirectoTotal = costoDirectoSobre + costoDirectoBajo;

  const costosIndirectos = costoDirectoTotal * (inputs.pctCostosIndirectos / 100);
  const gastosFinancieros = (costoDirectoTotal + costosIndirectos) * 0.04;
  const costoTotalObraSinTierra = costoDirectoTotal + costosIndirectos + gastosFinancieros;

  const residualSuelo = ventasTotales * (1 - inputs.margenObjetivoPct / 100) - costoTotalObraSinTierra;

  const valorTierraUsado = inputs.valorSueloPropuesto ?? Math.max(0, residualSuelo);
  const utilidadEstimada = ventasTotales - (costoTotalObraSinTierra + valorTierraUsado);
  const margenObtenidoPct = (utilidadEstimada / ventasTotales) * 100;

  let estadoViabilidad: 'VERDE' | 'AMARILLO' | 'ROJO' = 'ROJO';
  if (margenObtenidoPct >= 15) {
    estadoViabilidad = 'VERDE';
  } else if (margenObtenidoPct >= 10) {
    estadoViabilidad = 'AMARILLO';
  }

  return {
    areaOcupada,
    areaConstruibleSobre,
    areaVendible,
    areaSotanos,
    areaTotalObra,
    ventasArea,
    ventasParqueaderos,
    ventasTotales,
    costoDirectoSobre,
    costoDirectoBajo,
    costoDirectoTotal,
    costosIndirectos,
    gastosFinancieros,
    costoTotalObraSinTierra,
    residualSuelo,
    utilidadEstimada,
    margenObtenidoPct,
    estadoViabilidad,
  };
}
