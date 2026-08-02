'use client';

import React, { useState } from 'react';
import { calcularPrefactibilidad, KUBICInputs, KUBICResults } from '../lib/calculator';
import { consultarNormaPorDireccion, DatosPredioBogota } from '../lib/sinupot';

export default function Home() {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [cargando, setCargando] = useState(false);
  const [direccion, setDireccion] = useState('');
  const [datosPredio, setDatosPredio] = useState<DatosPredioBogota | null>(null);

  const [inputs, setInputs] = useState<KUBICInputs>({
    areaLote: 850,
    indiceOcupacion: 0.7,
    indiceConstruccion: 4.0,
    eficienciaPlanta: 80,
    numSotanos: 2,
    costoObraSobreM2: 3200000,
    precioVentaM2: 8500000,
    precioParqueaderoUnitario: 25000000,
    numParqueaderos: 20,
    pctCostosIndirectos: 15,
    margenObjetivoPct: 20,
  });

  const [resultados, setResultados] = useState<KUBICResults | null>(null);

  // Consulta y actualización dinámica directa
  const handleBuscarDireccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!direccion.trim()) return;

    setCargando(true);
    const predio = await consultarNormaPorDireccion(direccion);
    setDatosPredio(predio);

    // Sobrescribir inputs obligatoriamente con los datos devueltos para el predio
    const nuevosInputs: KUBICInputs = {
      ...inputs,
      areaLote: predio.areaLote,
      indiceOcupacion: predio.indiceOcupacion,
      indiceConstruccion: predio.indiceConstruccion,
    };
    
    setInputs(nuevosInputs);
    
    // Recalcular el modelo financiero de inmediato
    const res = calcularPrefactibilidad(nuevosInputs);
    setResultados(res);

    setCargando(false);
    setPaso(2);
  };

  const handleRecalcular = (nuevosInputs: KUBICInputs) => {
    setInputs(nuevosInputs);
    const res = calcularPrefactibilidad(nuevosInputs);
    setResultados(res);
  };

  const formatCOP = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-black tracking-wider text-orange-500">KUBIC</span>
          <span className="text-xs border-l border-slate-700 pl-3 text-slate-400 uppercase tracking-widest hidden sm:inline">
            Análisis Inmobiliario Express
          </span>
        </div>
        <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 text-slate-300">
          Bogotá D.C. / POT Dec. 555
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* PASO 1: Buscador */}
        {paso === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 my-8 text-center max-w-2xl mx-auto border border-slate-200">
            <div className="inline-block bg-orange-100 text-orange-700 font-bold text-xs uppercase px-3 py-1 rounded-full mb-4">
              Prefactibilidad en 2 minutos
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
              Evalúa la viabilidad de tu lote o proyecto
            </h1>
            <p className="text-slate-600 text-sm mb-8">
              Ingresa la dirección en Bogotá para obtener la norma urbana y calcular el residual del suelo.
            </p>

            <form onSubmit={handleBuscarDireccion} className="space-y-4">
              <input
                type="text"
                placeholder="Ej: Calle 134 # 19-45 (Lisboa Norte)"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full px-5 py-4 text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-orange-500 text-lg shadow-inner"
                required
              />
              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition text-lg flex items-center justify-center"
              >
                {cargando ? 'Consultando SINUPOT / IDECA...' : 'Iniciar Análisis Gratis'}
              </button>
            </form>
          </div>
        )}

        {/* PASO 2: Parámetros */}
        {paso === 2 && datosPredio && (
          <div className="grid md:grid-cols-3 gap-6 my-4">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Norma Detectada</span>
              <h2 className="text-xl font-bold mt-1 mb-4 text-white">{datosPredio.direccion}</h2>
              
              <div className="space-y-3 text-sm border-t border-slate-800 pt-4">
                <div>
                  <span className="text-slate-400 block text-xs">Localidad / Barrio</span>
                  <span className="font-semibold text-orange-300">{datosPredio.localidad} - {datosPredio.barrio}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">CHIP Catastral</span>
                  <span className="font-semibold">{datosPredio.chip}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Tratamiento Urbanístico</span>
                  <span className="font-semibold">{datosPredio.tratamiento}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Área Lote Catastral</span>
                  <span className="font-semibold text-lg text-emerald-400">{inputs.areaLote} m²</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-xs">I. Ocupación</span>
                    <span className="font-semibold">{inputs.indiceOcupacion}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">I. Construcción</span>
                    <span className="font-semibold">{inputs.indiceConstruccion}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 space-y-5">
              <h2 className="text-lg font-bold text-slate-900 pb-2 border-b">
                Ajuste de Variables de Proyecto
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Área del Lote (m²)
                  </label>
                  <input
                    type="number"
                    value={inputs.areaLote}
                    onChange={(e) => handleRecalcular({ ...inputs, areaLote: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Niveles de Sótano: {inputs.numSotanos}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={inputs.numSotanos}
                    onChange={(e) => handleRecalcular({ ...inputs, numSotanos: Number(e.target.value) })}
                    className="w-full accent-orange-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Costo Obra ($/m² sobre rasante)
                  </label>
                  <input
                    type="number"
                    value={inputs.costoObraSobreM2}
                    onChange={(e) => handleRecalcular({ ...inputs, costoObraSobreM2: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Precio Venta ($/m² útil)
                  </label>
                  <input
                    type="number"
                    value={inputs.precioVentaM2}
                    onChange={(e) => handleRecalcular({ ...inputs, precioVentaM2: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg text-sm bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between">
                <button
                  onClick={() => setPaso(1)}
                  className="px-4 py-2 text-slate-600 font-bold text-sm"
                >
                  ← Cambiar Dirección
                </button>
                <button
                  onClick={() => setPaso(3)}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition"
                >
                  Ver Resultados de Viabilidad →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: Dashboard */}
        {paso === 3 && resultados && (
          <div className="space-y-6 my-4">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">Resultado de Prefactibilidad</span>
                <h1 className="text-2xl font-black mt-1">Diagnóstico KUBIC</h1>
                <p className="text-slate-400 text-sm">{direccion.toUpperCase()}</p>
              </div>

              <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className={`w-4 h-4 rounded-full animate-pulse ${
                  resultados.estadoViabilidad === 'VERDE' ? 'bg-emerald-500' :
                  resultados.estadoViabilidad === 'AMARILLO' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <div>
                  <span className="block text-xs text-slate-400 uppercase font-bold">Estado</span>
                  <span className={`text-xl font-black ${
                    resultados.estadoViabilidad === 'VERDE' ? 'text-emerald-400' :
                    resultados.estadoViabilidad === 'AMARILLO' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {resultados.estadoViabilidad === 'VERDE' ? 'VIABLE' :
                     resultados.estadoViabilidad === 'AMARILLO' ? 'AJUSTADO' : 'ALTO RIESGO'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold opacity-80">Valor Máximo Sugerido del Lote</span>
                <h2 className="text-3xl font-black mt-1">RESIDUAL DEL SUELO</h2>
              </div>
              <div className="text-right mt-4 sm:mt-0 bg-black/20 px-6 py-3 rounded-xl backdrop-blur-sm">
                <span className="text-3xl font-black">{formatCOP(resultados.residualSuelo)}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block">Área Lote</span>
                <span className="text-xl font-black text-slate-800">{inputs.areaLote} m²</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block">Área Vendible Útil</span>
                <span className="text-xl font-black text-slate-800">{resultados.areaVendible.toLocaleString()} m²</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block">Ventas Totales</span>
                <span className="text-xl font-black text-emerald-600">{formatCOP(resultados.ventasTotales)}</span>
              </div>
              <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
                <span className="text-xs text-slate-500 font-bold block">Utilidad Estimada</span>
                <span className="text-xl font-black text-orange-600">{formatCOP(resultados.utilidadEstimada)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setPaso(2)}
                className="px-4 py-2 text-slate-600 font-bold text-sm bg-white rounded-lg border shadow-sm"
              >
                ← Ajustar Parámetros
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
