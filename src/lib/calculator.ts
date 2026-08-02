export interface KUBICInputs {
  // 1. Datos de Norma y Proyecto
  nombreProyecto: string;
  ciudad: string;
  estrato: number;
  usoSuelo: string;
  areaLote: number;
  indiceOcupacion: number;
  indiceConstruccion: number;
  eficienciaPlantaPct: number; // Ej: 82%

  // 2. Subestructura (Sótanos)
  numSotanos: number;
  areaSotanoPorNivel: number; // Por defecto suele ser similar a Ocupación

  // 3. Costos Directos
  costoDirectoSobreM2: number; // Costo por m2 construido sobre rasante
  costoDirectoBajoM2: number;  // Costo por m2 de sótano / excavación

  // 4. Costos Indirectos Desglosados (% sobre costo directo o valor fijo)
  pctEstudiosDiseños: number;   // Ej: 4%
  pctLicenciasImpuestos: number; // Ej: 3%
  pctGerenciaSupervision: number;// Ej: 4%
  pctVentasComercial: number;   // Ej: 5%
  pctImprevistosFinancieros: number; // Ej: 4%

  // 5. Estrategia de Tierra e Ingresos
  precioVentaM2: number;
  valorLotePactado?: number; // Opcional: Si ya hay precio de lote
  margenObjetivoPct: number; // Ej: 20%
}

export interface KUBICResults {
  // Áreas
  areaOcupacionP1: number;
  areaTotalSobreRasante: number;
  areaVendibleUtil: number;
  areaNoVendible: number;
  areaTotalSotanos: number;
  areaTotalConstruida: number;

  // Costos
  costoDirectoSobre: number;
  costoDirectoBajo: number;
  costoDirectoTotal: number;
  costosIndirectosTotal: number;
  costoTotalProyectoSinLote: number;

  // Ventas e Ingresos
  ventasTotales: number;

  // Resultados Financieros
  residualSueloSugerido: number; // Valor máximo pagadero por el lote
  valorM2LoteSugerido: number;
  utilidadEstimada: number;
  margenSobreVentasPct: number;
  estadoViabilidad: 'VERDE' | 'AMARILLO' | 'ROJO';
}

export function calcularPrefactibilidadCompleta(i: KUBICInputs): KUBICResults {
  // 1. Cálculos Físicos
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

  // 5. Análisis del Lote y Utilidad
  // Ventas = CostosDirectos + CostosIndirectos + Lote + Utilidad
  // UtilidadDeseada = Ventas * MargenObjetivo
  const utilidadObjetivo = ventasTotales * (i.margenObjetivoPct / 100);
  const residualSueloSugerido = Math.max(0, ventasTotales - costoTotalProyectoSinLote - utilidadObjetivo);
  const valorM2LoteSugerido = residualSueloSugerido / i.areaLote;

  // Si el usuario ingresó un valor de lote fijo, calculamos la utilidad real
  const costoLoteEfectivo = i.valorLotePactado && i.valorLotePactado > 0 ? i.valorLotePactado : residualSueloSugerido;
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
