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

export async function consultarNormaPorDireccion(direccion: string): Promise<DatosPredioBogota> {
  // Simulación de respuesta de API geográfica IDECA/SINUPOT (Bogotá)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    chip: "AAA0123ABCD",
    direccion: direccion.toUpperCase(),
    barrio: "CHAPINERO CENTRAL",
    localidad: "CHAPINERO",
    areaLote: 850,
    tratamiento: "Renovación Urbana",
    usoPrincipal: "Residencial / Comercial",
    indiceOcupacion: 0.7,
    indiceConstruccion: 4.0,
  };
}
