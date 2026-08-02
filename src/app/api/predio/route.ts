import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const direccion = searchParams.get('direccion');

  if (!direccion) {
    return NextResponse.json({ error: 'La dirección es requerida' }, { status: 400 });
  }

  try {
    const dirEncoded = encodeURIComponent(direccion.trim());
    
    // 1. Geocodificación oficial mediante la API de IDECA / Catastro Distrital
    const urlGeo = `https://serviceweb.ideca.gov.co/geocoder/direccion?direccion=${dirEncoded}`;
    const resGeo = await fetch(urlGeo, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 } // Cache inteligente de 1 hora
    });

    if (resGeo.ok) {
      const data = await resGeo.json();
      
      // Si la API de IDECA encuentra el predio exacto en Bogotá
      if (data && data.ubicacion) {
        const u = data.ubicacion;
        
        return NextResponse.json({
          exito: true,
          origen: 'IDECA_CATASTRO_OFICIAL',
          chip: u.chip || u.codigo_predial || 'S/N CATASTRAL',
          direccion: u.direccionFormateada || direccion.toUpperCase(),
          barrio: u.barrio || 'BOGOTÁ',
          localidad: u.localidad || 'BOGOTÁ D.C.',
          areaLote: Number(u.areaTerreno || u.area_terreno) || 0,
          tratamiento: u.tratamientoUrbanistico || u.tratamiento || 'Consolidación Urbana',
          usoPrincipal: u.usoPredio || u.uso || 'Residencial / Comercial',
          indiceOcupacion: u.indiceOcupacion ? Number(u.indiceOcupacion) : 0.70,
          indiceConstruccion: u.indiceConstruccion ? Number(u.indiceConstruccion) : 4.0,
        });
      }
    }

    // 2. Consulta de respaldo a la Capa WFS/REST pública de Catastro en ArcGIS Bogotá
    const urlArcGIS = `https://mapas.bogota.gov.co/arcgis/rest/services/Catastro/Predios/MapServer/0/query?where=DIRECCION+LIKE+'%25${dirEncoded}%25'&outFields=CHIP,DIRECCION,BARRIO,LOCALIDAD,AREA_TERRENO,TRATAMIENTO&f=json`;
    const resArcGIS = await fetch(urlArcGIS);
    
    if (resArcGIS.ok) {
      const dataArc = await resArcGIS.json();
      if (dataArc.features && dataArc.features.length > 0) {
        const attr = dataArc.features[0].attributes;
        return NextResponse.json({
          exito: true,
          origen: 'CATASTRO_ARCGIS_WFS',
          chip: attr.CHIP || 'SIN_CHIP',
          direccion: attr.DIRECCION || direccion.toUpperCase(),
          barrio: attr.BARRIO || 'BOGOTÁ',
          localidad: attr.LOCALIDAD || 'BOGOTÁ D.C.',
          areaLote: Number(attr.AREA_TERRENO) || 0,
          tratamiento: attr.TRATAMIENTO || 'Consolidación',
          usoPrincipal: 'Residencial / Comercial',
          indiceOcupacion: 0.70,
          indiceConstruccion: 4.0,
        });
      }
    }

    return NextResponse.json({
      exito: false,
      mensaje: 'Dirección no encontrada en la base catastral oficial de Bogotá'
    }, { status: 444 });

  } catch (error: any) {
    return NextResponse.json({
      exito: false,
      error: error.message || 'Error de conexión con la servidor de Catastro'
    }, { status: 500 });
  }
}
