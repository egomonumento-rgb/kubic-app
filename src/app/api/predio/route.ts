import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const direccion = searchParams.get('direccion');

  if (!direccion) {
    return NextResponse.json({ error: 'Dirección requerida' }, { status: 400 });
  }

  const dirUpper = direccion.toUpperCase().trim();

  // Generación de un hash único basado en la dirección
  let hash = 0;
  for (let i = 0; i < dirUpper.length; i++) {
    hash = (hash << 5) - hash + dirUpper.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);

  // Extraer números para la nomenclatura
  const numeros = dirUpper.match(/\d+/g) || ['100', '15', '20'];
  const numCalleCra = parseInt(numeros[0] || '100', 10);
  const numPlaca = parseInt(numeros[1] || '15', 10);

  // Determinación de localidad y barrio dinámicos
  let localidad = 'USAQUÉN';
  let barrio = 'SANTA BÁRBARA';
  let tratamiento = 'Consolidación Urbana';

  if (dirUpper.includes('CHAPINERO') || numCalleCra < 70) {
    localidad = 'CHAPINERO';
    barrio = 'CHAPINERO CENTRAL';
    tratamiento = 'Renovación Urbana';
  } else if (dirUpper.includes('SUBA') || (numCalleCra >= 100 && dirUpper.includes('CRA'))) {
    localidad = 'SUBA';
    barrio = 'LA ALHAMBRA / NIZA';
    tratamiento = 'Consolidación Urbana';
  } else if (dirUpper.includes('KENNEDY') || dirUpper.includes('AMERICAS')) {
    localidad = 'KENNEDY';
    barrio = 'MUNDIAL';
    tratamiento = 'Desarrollo';
  } else if (numCalleCra >= 120) {
    localidad = 'USAQUÉN';
    barrio = 'CEDRITOS / LISBOA';
    tratamiento = 'Consolidación';
  }

  // Cálculo dinámico de metros cuadrados de lote e índices según la dirección
  const areaLote = 320 + (posHash % 980); // Lotes de 320 a 1300 m²
  const chipCalculado = `AAA${(posHash % 8999 + 1000).toString()}FC${(numCalleCra % 90 + 10).toString()}`;
  const ic = Number((2.5 + ((posHash % 35) / 10)).toFixed(1));
  const io = tratamiento.includes('Renovación') ? 0.70 : 0.60;

  return NextResponse.json({
    exito: true,
    chip: chipCalculado,
    direccion: dirUpper,
    barrio: barrio,
    localidad: localidad,
    areaLote: areaLote,
    tratamiento: tratamiento,
    usoPrincipal: 'Residencial Multifamiliar / Comercio',
    indiceOcupacion: io,
    indiceConstruccion: ic,
    origen: 'CALCULO_DINAMICO_NOMENCLATURA'
  });
}
