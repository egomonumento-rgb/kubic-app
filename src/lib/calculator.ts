export interface KUBICInputs {
  nombreProyecto: string;
  ciudad: string;
  estrato: number;
  usoSuelo: string;
  areaLote: number;
  indiceOcupacion: number;
  indiceConstruccion: number;
  eficienciaPlantaPct: number;

  numSotanos: number;
  areaSotanoPorNivel: number;

  costoDirectoSobreM2: number;
  costoDirectoBajoM2: number;

  pctEstudiosDiseños: number;
  pctLicenciasImpuestos: number;
  pctGerenciaSupervision: number;
  pctVentasComercial: number;
  pctImprevistosFinancieros: number;

  precioVentaM2: number;
  valorLotePactado?: number;
  margenObjetivoPct: number;
}

export interface KUBICResults {
  areaOcupacionP1: number;
  areaTotalSobreRasante: number;
  areaVendibleUtil: number;
  areaNoVendible: number;
  areaTotalSotanos: number;
  areaTotalConstruida: number;

  costoDirectoSobre: number;
  costoDirectoBajo: number;
  costoDirectoTotal: number;
  costosIndirectosTotal: number;
  costoTotalProyectoSinLote: number;

  ventasTotales: number;

  residualSueloSugerido: number; // Máximo 20% de las ventas totales
  valorM2LoteSugerido: number;
  utilidadEstimada: number;
  margenSobreVentasPct: number;
  estadoViabilidad: 'VERDE' | 'AMARILLO' | 'ROJO';
}

export function calcularPrefactibilidadCompleta(i: KUBICInputs): KUBICResults {
  // 1. Áreas
  const areaOcupacionP1 = i.areaLote * i.indiceOcupacion;
  const areaTotalSobreRasante = i.areaLote * i.indiceConstruccion;
  const areaVendibleUtil = areaTotalSobreRasante * (i.eficienciaPlantaPct / 100);
  const areaNoVendible = areaTotalSobreRasante - areaVendibleUtil;
  
  const areaSotanoNivel = i.areaSotanoPorNivel > 0 ? i.areaSotanoPorNivel : areaOcupacionP1;
  const areaTotalSotanos = i.numSotanos * areaSotanoNivel;
  const areaTotalConstruida = areaTotalSobreRasante + areaTotalSotanos;

  // 2. Costos Directos
  const costoDirectoSobre = areaTotalSobreRasante * i.costoDirectoSobreM2;
  const costoDirectoBajo = areaTotalSotanos * i.costoDirectoBajoM2;
  const costoDirectoTotal = costoDirectoSobre + costoDirectoBajo;

  // 3. Costos Indirectos
  const pctIndirectosTotal = 
    i.pctEstudiosDiseños + 
    i.pctLicenciasImpuestos + 
    i.pctGerenciaSupervision + 
    i.pctVentasComercial + 
    i.pctImprevistosFinancieros;
    
  const costosIndirectosTotal = costoDirectoTotal * (pctIndirectosTotal / 100);
  const costoTotalProyectoSinLote = costoDirectoTotal + costosIndirectosTotal;

  // 4. Ventas
  const ventasTotales = areaVendibleUtil * i.precioVentaM2;

  // 5. Lote Topado al 20% de Ventas Máximo
  const topeLote20Pct = ventasTotales * 0.20;
  const residualMatematico = Math.max(0, ventasTotales - costoTotalProyectoSinLote - (ventasTotales * (i.margenObjetivoPct / 100)));
  
  // El lote nunca supera el 20% de las ventas
  const residualSueloSugerido = Math.min(topeLote20Pct, residualMatematico);
  const valorM2LoteSugerido = i.areaLote > 0 ? residualSueloSugerido / i.areaLote : 0;

  // Si hay valor de lote pactado por el propietario, usas ese; de lo contrario usas el valor sugerido topado
  const costoLoteEfectivo = (i.valorLotePactado && i.valorLotePactado > 0) ? i.valorLotePactado : residualSueloSugerido;
  
  // La Utilidad toma todo el remanente (Si el lote cuesta menos o se topa al 20%, la utilidad sube)
  const utilidadEstimada = ventasTotales - (costoTotalProyectoSinLote + costoLoteEfectivo);
  const margenSobreVentasPct = ventasTotales > 0 ? (utilidadEstimada / ventasTotales) * 100 : 0;

  let estadoViabilidad: 'VERDE' | 'AMARILLO' | 'ROJO' = 'ROJO';
  if (margenSobreVentasPct >= i.margenObjetivoPct) {
    estadoViabilidad = 'VERDE';
  } else if (margenSobreVentasPct >= 12) {
    estadoViabilidad = 'AMARILLO';
  }

  return {
    areaOcupacionP1,
    areaTotalSobreRasante,
    areaVendibleUtil,
    areaNoVendible,
    areaTotalSotanos,
    areaTotalConstruida,
    costoDirectoSobre,
    costoDirectoBajo,
    costoDirectoTotal,
    costosIndirectosTotal,
    costoTotalProyectoSinLote,
    ventasTotales,
    residualSueloSugerido,
    valorM2LoteSugerido,
    utilidadEstimada,
    margenSobreVentasPct,
    estadoViabilidad,
  };
}
