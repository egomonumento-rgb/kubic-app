export interface DatosPredioBogota {
  chip: string;
  direccion: string;
  barrio: string;
  localidad: string;
  areaLote: number;
  tratamiento: string;
  usoPrincipal: string;
  indiceOcupacion: number;
  indiceConstruccion: number;
}

export async function consultarNormaPorDireccion(direccionInput: string): Promise<DatosPredioBogota> {
  // Simular latencia de red para experiencia UX
  await new Promise((resolve) => setTimeout(resolve, 800));

  const dirUpper = direccionInput.toUpperCase().trim();
  
  // Extraer números de la dirección para calcular variables dinámicas únicas
  const numeros = dirUpper.match(/\d+/g) || ["72", "10", "34"];
  const numPrincipal = parseInt(numeros[0] || "70", 10);
  const numSecundario = parseInt(numeros[1] || "15", 10);
  
  // 1. Asignación de Localidad y Barrio según el rango de Calle/Carrera
  let localidad = "USAQUÉN";
  let barrio = "SANTA BÁRBARA";
  let tratamiento = "Consolidación Urbana";
  let usoPrincipal = "Residencial / Servicios";

  if (dirUpper.includes("CARRERA") || dirUpper.includes("CRA") || dirUpper.includes("AK")) {
    if (numSecundario < 30) {
      localidad = "CHAPINERO";
      barrio = "CHAPINERO CENTRAL";
      tratamiento = "Renovación Urbana";
      usoPrincipal = "Comercio / Servicios / Vivienda";
    } else if (numSecundario < 100) {
      localidad = "BARRIOS UNIDOS";
      barrio = "12 DE OCTUBRE";
      tratamiento = "Redesarrollo";
      usoPrincipal = "Residencial / Comercio";
    }
  } else if (dirUpper.includes("CALLE") || dirUpper.includes("CL") || dirUpper.includes("AC")) {
    if (numPrincipal > 100) {
      localidad = "USAQUÉN";
      barrio = "CEDRITOS";
      tratamiento = "Consolidación";
      usoPrincipal = "Residencial Multifamiliar";
    } else if (numPrincipal > 60) {
      localidad = "CHAPINERO";
      barrio = "ROSALES / PORCIÚNCULA";
      tratamiento = "Conservación / Consolidación";
      usoPrincipal = "Residencial / Oficinas";
    } else {
      localidad = "TEUSAQUILLO";
      barrio = "PALERMO";
      tratamiento = "Renovación Urbana";
      usoPrincipal = "Equipamiento / Comercio / Vivienda";
    }
  }

  // 2. Cálculo dinámico del área del lote y los índices normativos según los números
  const areaLote = Math.min(2500, Math.max(350, (numPrincipal * 12) + (numSecundario * 8)));
  const io = dirUpper.includes("RENOVACION") || tratamiento.includes("Renovación") ? 0.70 : 0.60;
  const ic = Number((2.0 + ((numPrincipal % 40) / 10) + ((numSecundario % 20) / 10)).toFixed(1));

  // 3. Generación de CHIP único
  const chipCalculado = `AAA0${(numPrincipal * 31 + numSecundario * 17).toString().padStart(4, '0')}XYZ`;

  return {
    chip: chipCalculado,
    direccion: dirUpper,
    barrio: barrio,
    localidad: localidad,
    areaLote: areaLote,
    tratamiento: tratamiento,
    usoPrincipal: usoPrincipal,
    indiceOcupacion: io,
    indiceConstruccion: Math.min(6.5, Math.max(2.5, ic)),
  };
}
