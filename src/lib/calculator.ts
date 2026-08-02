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
  coeficienteSotano: number; // Ej: 1.20 (20% más costoso que sobre rasante)

  pctEstudiosDiseños: number;
  pctLicenciasImpuestos: number;
  pctGerenciaSupervision: number;
  pctVentasComercial: number;
  pctImprevistosFinancieros: number;

  precioVentaM2: number;
  valorLotePactado?: number;
  margenObjetivoPct: number; // Por defecto 20%
}

export interface KUBICResults {
  areaOcupacionP1: number;
  areaTotalSobreRasante: number;
  areaVendibleUtil: number;
  areaNoVendible: number;
  areaTotalSotanos: number;
  areaTotalConstruida: number;

  costoDirectoSobreM2Calculado: number;
  costoDirectoBajoM2Calculado: number;
  costoDirectoSobre: number;
  costoDirectoBajo: number;
  costoDirectoTotal: number;
  costosIndirectosTotal: number;
  costoTotalProyectoSinLote: number;

  ventasTotales: number;

  residualSueloSugerido: number;
  incidenciaTierraPct: number; // Porcentaje que representa sobre Ventas
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

  // 2. Costo Bajo Rasante vinculado al Coeficiente del Costo Sobre Rasante
  const costoDirectoSobreM2Calculado = i.costoDirectoSobreM2;
  const costoDirectoBajoM2Calculado = Math.round(i.costoDirectoSobreM2 * i.coeficienteSotano);

  const costoDirectoSobre = areaTotalSobreRasante * costoDirectoSobreM2Calculado;
  const costoDirectoBajo = areaTotalSotanos * costoDirectoBajoM2Calculado;
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

  // 4. Ventas Proyectadas
  const ventasTotales = areaVendibleUtil * i.precioVentaM2;

  // 5. EQUILIBRIO FINANCIERO DEL SUELO (Banda entre 10% y 20% de Ventas)
  const pisoLote10Pct = ventasTotales * 0.10;
  const topeLote20Pct = ventasTotales * 0.20;
  const margenMinimoDecimal = i.margenObjetivoPct / 100;

  // Remanente disponible para tierra garantizando el margen objetivo del desarrollador
  const disponibleParaTierra = Math.max(0, ventasTotales - costoTotalProyectoSinLote - (ventasTotales * margenMinimoDecimal));

  let residualSueloSugerido = 0;

  if (disponibleParaTierra >= topeLote20Pct) {
    // Escenario Excelente: Alcanza para el tope de lote (20%) y el sobrante aumenta la utilidad
    residualSueloSugerido = topeLote20Pct;
  } else if (disponibleParaTierra >= pisoLote10Pct) {
    // Escenario Equilibrado: La tierra queda en la banda entre el 10% y el 20%, manteniendo el margen del 20%
    residualSueloSugerido = disponibleParaTierra;
  } else {
    // Escenario Apretado: No alcanza al 10% de tierra sin tumbar la utilidad objetivo
    residualSueloSugerido = disponibleParaTierra;
  }

  // Si el usuario ingresó un valor de lote pactado por el propietario, prevalece ese
  const costoLoteEfectivo = (i.valorLotePactado && i.valorLotePactado > 0) ? i.valorLotePactado : residualSueloSugerido;
  
  const utilidadEstimada = ventasTotales - (costoTotalProyectoSinLote + costoLoteEfectivo);
  const margenSobreVentasPct = ventasTotales > 0 ? (utilidadEstimada / ventasTotales) * 100 : 0;
  const incidenciaTierraPct = ventasTotales > 0 ? (costoLoteEfectivo / ventasTotales) * 100 : 0;

  const valorM2LoteSugerido = i.areaLote > 0 ? residualSueloSugerido / i.areaLote : 0;

  // Diagnóstico de Viabilidad
  let estadoViabilidad: 'VERDE' | 'AMARILLO' | 'ROJO' = 'ROJO';
  if (margenSobreVentasPct >= i.margenObjetivoPct && incidenciaTierraPct >= 10.0 && incidenciaTierraPct <= 20.5) {
    estadoViabilidad = 'VERDE';
  } else if (margenSobreVentasPct >= 12.0) {
    estadoViabilidad = 'AMARILLO';
  }

  return {
    areaOcupacionP1,
    areaTotalSobreRasante,
    areaVendibleUtil,
    areaNoVendible,
    areaTotalSotanos,
    areaTotalConstruida,
    costoDirectoSobreM2Calculado,
    costoDirectoBajoM2Calculado,
    costoDirectoSobre,
    costoDirectoBajo,
    costoDirectoTotal,
    costosIndirectosTotal,
    costoTotalProyectoSinLote,
    ventasTotales,
    residualSueloSugerido,
    incidenciaTierraPct,
    valorM2LoteSugerido,
    utilidadEstimada,
    margenSobreVentasPct,
    estadoViabilidad,
  };
}
