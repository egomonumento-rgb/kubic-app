'use client';

import React, { useState } from 'react';
import { calcularPrefactibilidadCompleta, KUBICInputs, KUBICResults } from '../lib/calculator';

export default function Home() {
  const [paso, setPaso] = useState<1 | 2>(1);

  // Formulario con todas las variables técnicas y financieras
  const [inputs, setInputs] = useState<KUBICInputs>({
    nombreProyecto: '',
    ciudad: 'Bogotá D.C.',
    estrato: 4,
    usoSuelo: 'Residencial Multifamiliar',
    areaLote: 800,
    indiceOcupacion: 0.70,
    indiceConstruccion: 4.0,
    eficienciaPlantaPct: 82,

    numSotanos: 2,
    areaSotanoPorNivel: 560, // 800 * 0.7

    costoDirectoSobreM2: 3200000,
    costoDirectoBajoM2: 3800000,

    pctEstudiosDiseños: 4.0,
    pctLicenciasImpuestos: 3.5,
    pctGerenciaSupervision: 4.0,
    pctVentasComercial: 5.0,
    pctImprevistosFinancieros: 4.5,

    precioVentaM2: 8500000,
    valorLotePactado: 0, // 0 para calcular Residual
    margenObjetivoPct: 20,
  });

  const [resultados, setResultados] = useState<KUBICResults | null>(null);

  const handleCalcular = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calcularPrefactibilidadCompleta(inputs);
    setResultados(res);
    setPaso(2);
  };

  const handleRecalcularParams = (nuevosInputs: KUBICInputs) => {
    setInputs(nuevosInputs);
    const res = calcularPrefactibilidadCompleta(nuevosInputs);
    setResultados(res);
  };

  const formatCOP = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const totalPctIndirectos = 
    inputs.pctEstudiosDiseños + 
    inputs.pctLicenciasImpuestos + 
    inputs.pctGerenciaSupervision + 
    inputs.pctVentasComercial + 
    inputs.pctImprevistosFinancieros;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-black tracking-wider text-orange-500">KUBIC</span>
          <span className="text-xs border-l border-slate-700 pl-3 text-slate-400 uppercase tracking-widest hidden sm:inline">
            Modelo Profesional de Prefactibilidad Inmobiliaria
          </span>
        </div>
        <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-slate-300">
          Versión Técnica Multivariable
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* PASO 1: Captura Técnica Completa */}
        {paso === 1 && (
          <div className="space-y-6 my-4">
            {/* Banner Orientación Norma */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg border border-slate-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">¿Necesitas verificar la norma local?</span>
                  <h2 className="text-xl font-bold mt-1">Consultar Portales de Planeación Oficiales</h2>
                  <p className="text-slate-300 text-xs mt-1 max-w-xl">
                    Consulta el Área, I.O. e I.C. oficial en el visor catastral o POT de tu municipio e ingrésalos en el formulario.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://sinupotp.sdp.gov.co/sinupot/index.jsf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition flex items-center gap-1"
                  >
                    🔍 SINUPOT (Bogotá) ↗
                  </a>
                  <a
                    href="https://www.igac.gov.co/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow transition flex items-center gap-1"
                  >
                    🌐 IGAC (Nacional) ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Formulario Estructurado */}
            <form onSubmit={handleCalcular} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 space-y-8">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Estructuración de Prefactibilidad</h1>
                <p className="text-slate-500 text-xs mt-1">Ingresa todos los parámetros físicos, urbanísticos, directos e indirectos del proyecto.</p>
              </div>

              {/* 1. Identificación y Ubicación */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-orange-600 uppercase tracking-wider border-b pb-1">1. Identificación y Clasificación</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nombre / Referencia</label>
                    <input
                      type="text"
                      placeholder="Ej: Edificio Lisboa 134"
                      value={inputs.nombreProyecto}
                      onChange={(e) => setInputs({ ...inputs, nombreProyecto: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad / Municipio</label>
                    <input
                      type="text"
                      value={inputs.ciudad}
                      onChange={(e) => setInputs({ ...inputs, ciudad: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Uso de Suelo Predominante</label>
                    <select
                      value={inputs.usoSuelo}
                      onChange={(e) => setInputs({ ...inputs, usoSuelo: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                    >
                      <option value="Residencial Multifamiliar">Residencial Multifamiliar</option>
                      <option value="Comercial / Servicios">Comercial / Servicios</option>
                      <option value="Mixto (Comercio + Vivienda)">Mixto (Comercio + Vivienda)</option>
                      <option value="Oficinas / Corporativo">Oficinas / Corporativo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Estrato Socioeconómico</label>
                    <select
                      value={inputs.estrato}
                      onChange={(e) => setInputs({ ...inputs, estrato: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                    >
                      <option value={1}>Estrato 1</option>
                      <option value={2}>Estrato 2</option>
                      <option value={3}>Estrato 3</option>
                      <option value={4}>Estrato 4</option>
                      <option value={5}>Estrato 5</option>
                      <option value={6}>Estrato 6</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Física del Lote y Subestructura */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-orange-600 uppercase tracking-wider border-b pb-1">2. Física del Lote y Subestructura (Sótanos)</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Área Lote (m²)</label>
                    <input
                      type="number"
                      value={inputs.areaLote}
                      onChange={(e) => {
                        const area = Number(e.target.value);
                        setInputs({
                          ...inputs,
                          areaLote: area,
                          areaSotanoPorNivel: area * inputs.indiceOcupacion
                        });
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Índice Ocupación (I.O.)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="1.0"
                      value={inputs.indiceOcupacion}
                      onChange={(e) => {
                        const io = Number(e.target.value);
                        setInputs({
                          ...inputs,
                          indiceOcupacion: io,
                          areaSotanoPorNivel: inputs.areaLote * io
                        });
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Índice Construcción (I.C.)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="12.0"
                      value={inputs.indiceConstruccion}
                      onChange={(e) => setInputs({ ...inputs, indiceConstruccion: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Eficiencia Planta (%)</label>
                    <input
                      type="number"
                      min="50"
                      max="95"
                      value={inputs.eficienciaPlantaPct}
                      onChange={(e) => setInputs({ ...inputs, eficienciaPlantaPct: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Niveles de Sótano</label>
                    <input
                      type="number"
                      min="0"
                      max="6"
                      value={inputs.numSotanos}
                      onChange={(e) => setInputs({ ...inputs, numSotanos: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Área Sótano por Nivel (m²)</label>
                    <input
                      type="number"
                      value={inputs.areaSotanoPorNivel}
                      onChange={(e) => setInputs({ ...inputs, areaSotanoPorNivel: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 3. Costos Directos */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-orange-600 uppercase tracking-wider border-b pb-1">3. Costos Directos de Obra ($/m²)</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Costo Directo Sobre Rasante ($/m² construidos)</label>
                    <input
                      type="number"
                      value={inputs.costoDirectoSobreM2}
                      onChange={(e) => setInputs({ ...inputs, costoDirectoSobreM2: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Costo Directo Bajo Rasante / Sótanos ($/m²)</label>
                    <input
                      type="number"
                      value={inputs.costoDirectoBajoM2}
                      onChange={(e) => setInputs({ ...inputs, costoDirectoBajoM2: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 4. Desglose Costos Indirectos */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-1">
                  <h3 className="text-xs font-black text-orange-600 uppercase tracking-wider">4. Desglose de Costos Indirectos (% sobre Costo Directo)</h3>
                  <span className="text-xs font-extrabold text-slate-700">Total Indirectos: {totalPctIndirectos.toFixed(1)}%</span>
                </div>
                <div className="grid sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Estudios / Diseños (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={inputs.pctEstudiosDiseños}
                      onChange={(e) => setInputs({ ...inputs, pctEstudiosDiseños: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Licencias / Impuestos (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={inputs.pctLicenciasImpuestos}
                      onChange={(e) => setInputs({ ...inputs, pctLicenciasImpuestos: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Gerencia / Interventoría (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={inputs.pctGerenciaSupervision}
                      onChange={(e) => setInputs({ ...inputs, pctGerenciaSupervision: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Ventas / Mercadeo (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={inputs.pctVentasComercial}
                      onChange={(e) => setInputs({ ...inputs, pctVentasComercial: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Imprevistos / Finan. (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={inputs.pctImprevistosFinancieros}
                      onChange={(e) => setInputs({ ...inputs, pctImprevistosFinancieros: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Precios Venta, Valor Lote y Margen */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-orange-600 uppercase tracking-wider border-b pb-1">5. Valor de Venta, Lote y Margen Objetivo</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Precio Venta ($/m² útil vendible)</label>
                    <input
                      type="number"
                      value={inputs.precioVentaM2}
                      onChange={(e) => setInputs({ ...inputs, precioVentaM2: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 font-bold focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Valor Pactado Lote ($ - Opción si ya existe)</label>
                    <input
                      type="number"
                      placeholder="Dejar en 0 para calcular Residual"
                      value={inputs.valorLotePactado || ''}
                      onChange={(e) => setInputs({ ...inputs, valorLotePactado: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Margen Objetivo Desarrollador (%)</label>
                    <input
                      type="number"
                      value={inputs.margenObjetivoPct}
                      onChange={(e) => setInputs({ ...inputs, margenObjetivoPct: Number(e.target.value) })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm bg-slate-50 focus:border-orange-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 px-6 rounded-xl shadow-lg transition text-base mt-6"
              >
                Generar Informe de Prefactibilidad Financiera →
              </button>
            </form>
          </div>
        )}

        {/* PASO 2: Dashboard Completo de Resultados */}
        {paso === 2 && resultados && (
          <div className="space-y-6 my-4">
            {/* Encabezado Principal */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">{inputs.ciudad} | Estrato {inputs.estrato} | {inputs.usoSuelo}</span>
                <h1 className="text-2xl font-black mt-1">{inputs.nombreProyecto || 'Proyecto Evaluado'}</h1>
                <p className="text-slate-400 text-xs mt-1">
                  Lote: {inputs.areaLote} m² | I.O: {inputs.indiceOcupacion} | I.C: {inputs.indiceConstruccion} | Eficiencia: {inputs.eficienciaPlantaPct}%
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className={`w-4 h-4 rounded-full animate-pulse ${
                  resultados.estadoViabilidad === 'VERDE' ? 'bg-emerald-500' :
                  resultados.estadoViabilidad === 'AMARILLO' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <div>
                  <span className="block text-xs text-slate-400 uppercase font-bold">Diagnóstico</span>
                  <span className={`text-xl font-black ${
                    resultados.estadoViabilidad === 'VERDE' ? 'text-emerald-400' :
                    resultados.estadoViabilidad === 'AMARILLO' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {resultados.estadoViabilidad === 'VERDE' ? 'PROYECTO VIABLE' :
                     resultados.estadoViabilidad === 'AMARILLO' ? 'MARGEN AJUSTADO' : 'ALTO RIESGO'}
                  </span>
                </div>
              </div>
            </div>

            {/* Residual del Suelo */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold opacity-80">Valor Máximo Sugerido de Compra de Tierra</span>
                <h2 className="text-3xl font-black mt-1">RESIDUAL DEL SUELO</h2>
              </div>
              <div className="text-right mt-4 sm:mt-0 bg-black/20 px-6 py-3 rounded-xl backdrop-blur-sm">
                <span className="text-3xl font-black">{formatCOP(resultados.residualSueloSugerido)}</span>
                <span className="block text-xs opacity-90 font-medium mt-0.5">
                  ({formatCOP(resultados.valorM2LoteSugerido)} / m² de lote)
                </span>
              </div>
            </div>

            {/* Balance de Áreas */}
            <div className="bg-white p-6 rounded-2xl shadow border border-slate-200">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-2 mb-4">Balance Físico de Edificabilidad y Áreas</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border">
                  <span className="text-xs text-slate-500 block">Área Construida Sobre Rasante</span>
                  <span className="text-lg font-black text-slate-800">{resultados.areaTotalSobreRasante.toLocaleString()} m²</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-xs text-emerald-700 font-bold block">Área Útil Vendible</span>
                  <span className="text-lg font-black text-emerald-800">{resultados.areaVendibleUtil.toLocaleString()} m²</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border">
                  <span className="text-xs text-slate-500 block">Área No Vendible (Circulaciones)</span>
                  <span className="text-lg font-black text-slate-800">{resultados.areaNoVendible.toLocaleString()} m²</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border">
                  <span className="text-xs text-slate-500 block">Área Construida en Sótanos ({inputs.numSotanos} N)</span>
                  <span className="text-lg font-black text-slate-800">{resultados.areaTotalSotanos.toLocaleString()} m²</span>
                </div>
              </div>
            </div>

            {/* Estratificación Financiera */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Costos */}
              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-2">Estructura de Costos del Proyecto</h3>
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-slate-600">Costos Directos Sobre Rasante:</span>
                  <span className="font-bold">{formatCOP(resultados.costoDirectoSobre)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-slate-600">Costos Directos Bajo Rasante (Sótanos):</span>
                  <span className="font-bold">{formatCOP(resultados.costoDirectoBajo)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b bg-slate-50 font-bold px-2 rounded">
                  <span>Total Costos Directos:</span>
                  <span className="text-slate-900">{formatCOP(resultados.costoDirectoTotal)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-slate-600">Total Costos Indirectos ({totalPctIndirectos.toFixed(1)}%):</span>
                  <span className="font-bold text-orange-600">{formatCOP(resultados.costosIndirectosTotal)}</span>
                </div>
                <div className="flex justify-between text-base font-black pt-2 text-slate-900">
                  <span>Costo Total (Sin Lote):</span>
                  <span>{formatCOP(resultados.costoTotalProyectoSinLote)}</span>
                </div>
              </div>

              {/* Ventas y Utilidad */}
              <div className="bg-white p-6 rounded-2xl shadow border border-slate-200 space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-2">Ingresos y Retorno</h3>
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-slate-600">Ventas Totales Proyectadas:</span>
                  <span className="font-black text-emerald-600 text-lg">{formatCOP(resultados.ventasTotales)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-slate-600">Utilidad Bruta Estimada:</span>
                  <span className="font-bold text-slate-800">{formatCOP(resultados.utilidadEstimada)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b bg-orange-50 font-bold px-2 rounded">
                  <span className="text-orange-900">Margen sobre Ventas Obtenido:</span>
                  <span className="text-orange-700 text-lg font-black">{resultados.margenSobreVentasPct.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-slate-500 pt-2">
                  Margen mínimo objetivo configurado: <strong className="text-slate-700">{inputs.margenObjetivoPct}%</strong>
                </p>
              </div>
            </div>

            {/* Botón Volver */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setPaso(1)}
                className="px-5 py-2.5 text-slate-700 font-bold text-sm bg-white rounded-xl border border-slate-300 shadow-sm hover:bg-slate-50 transition"
              >
                ← Modificar Parámetros y Volver a Calcular
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
