import { fetchJson, pool, sleep } from '../http.ts';

const API = 'https://www.infosubvenciones.es/bdnstrans/api';

/**
 * Nodos raíz del árbol de órganos de BDNS que corresponden a Catalunya:
 * la comunidad autónoma y las cuatro provincias del nivel local.
 */
const ARRELS_CATALUNYA = [
  { idAdmon: 'A', arrels: ['CATALUÑA'] },
  { idAdmon: 'L', arrels: ['BARCELONA', 'GIRONA', 'LLEIDA', 'TARRAGONA'] },
] as const;

/**
 * BDNS rechaza querystrings de más de ~2 KB con una página del WAF en vez de un error,
 * así que los ids de órgano se mandan en lotes.
 */
const ORGANS_PER_LOT = 150;

type NodeOrgan = { id: number; descripcion: string; children?: NodeOrgan[] };

export type BdnsItem = {
  numeroConvocatoria: string;
  descripcion?: string;
  descripcionLeng?: string;
  fechaRecepcion?: string;
  nivel1?: string;
  nivel2?: string;
  nivel3?: string;
};

export type BdnsDetall = {
  codigoBDNS: string;
  descripcion?: string;
  descripcionLeng?: string;
  tipoConvocatoria?: string;
  fechaRecepcion?: string;
  fechaInicioSolicitud?: string | null;
  fechaFinSolicitud?: string | null;
  textInicio?: string | null;
  textFin?: string | null;
  abierto?: boolean;
  presupuestoTotal?: number | null;
  sedeElectronica?: string | null;
  urlBasesReguladoras?: string | null;
  descripcionBasesReguladoras?: string | null;
  descripcionFinalidad?: string | null;
  organo?: { nivel1?: string; nivel2?: string; nivel3?: string };
  tiposBeneficiarios?: { descripcion: string }[];
  sectores?: { descripcion: string; codigo?: string }[];
};

/** Solo las hojas del subárbol son órganos consultables; los nodos intermedios agrupan. */
function fulles(node: NodeOrgan, acc: number[] = []): number[] {
  const fills = node.children ?? [];
  if (!fills.length) acc.push(node.id);
  else for (const f of fills) fulles(f, acc);
  return acc;
}

export type GrupOrgans = { idAdmon: string; ids: number[] };

/**
 * Devuelve los órganos de Catalunya agrupados por nivel de administración.
 *
 * Tres trampas, todas verificadas contra la API el 2026-09-11:
 *
 * 1. `regiones=51` parece el camino obvio y no lo es: filtra por la región declarada en la
 *    convocatoria, que la mayoría de convocatorias de la Generalitat deja vacía. Daba 1.826
 *    convocatorias en 12 meses y perdía las 177 que el RAISC daba por abiertas.
 * 2. Los dos árboles no tienen la misma profundidad. El autonómico es CCAA → órgano, pero el
 *    local es provincia → municipio → órgano. Tomar el segundo nivel en el local recoge nodos
 *    de agrupación que `busqueda` no reconoce (devuelven 0 resultados).
 * 3. Los espacios de ids de `idAdmon=A` y `idAdmon=L` **se solapan**: 728 ids aparecen en los
 *    dos árboles significando cosas distintas. Mezclarlos en una misma consulta devuelve
 *    convocatorias de otras comunidades (Ibiza, Santander, Baza...). Por eso se consulta cada
 *    nivel por separado y con su `tipoAdministracion`, nunca en un único `organos=`.
 */
export async function organsCatalunya(): Promise<GrupOrgans[]> {
  const grups: GrupOrgans[] = [];

  for (const { idAdmon, arrels } of ARRELS_CATALUNYA) {
    const arbre = await fetchJson<NodeOrgan[]>(`${API}/organos?vpd=GE&idAdmon=${idAdmon}`);
    const ids: number[] = [];
    for (const node of arbre) {
      if (!arrels.includes(node.descripcion.trim().toUpperCase() as never)) continue;
      fulles(node, ids);
    }
    if (!ids.length) throw new Error(`BDNS: cap òrgan de Catalunya a idAdmon=${idAdmon}`);
    grups.push({ idAdmon, ids: [...new Set(ids)] });
    await sleep(250);
  }

  return grups;
}

function lots<T>(items: readonly T[], mida: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += mida) out.push(items.slice(i, i + mida));
  return out;
}

/** Formato de fecha que espera BDNS en `fechaDesde`/`fechaHasta`. */
function ddmmyyyy(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export async function llistaConvocatories(
  grups: readonly GrupOrgans[],
  rang: { desde: string; fins: string }
): Promise<BdnsItem[]> {
  const vistos = new Map<string, BdnsItem>();
  const desde = ddmmyyyy(rang.desde);
  const fins = ddmmyyyy(rang.fins);

  for (const grup of grups) {
    for (const lot of lots(grup.ids, ORGANS_PER_LOT)) {
      for (let page = 0; ; page++) {
        const url =
          `${API}/convocatorias/busqueda?vpd=GE&pageSize=1000&page=${page}` +
          `&fechaDesde=${desde}&fechaHasta=${fins}` +
          `&tipoAdministracion=${grup.idAdmon}&organos=${lot.join(',')}`;
        const res = await fetchJson<{ content?: BdnsItem[]; last?: boolean }>(url);
        const content = res.content ?? [];
        for (const c of content) vistos.set(String(c.numeroConvocatoria), c);
        if (res.last || !content.length) break;
        await sleep(250);
      }
      await sleep(250);
    }
  }

  return [...vistos.values()];
}

export async function detall(codi: string): Promise<BdnsDetall | null> {
  try {
    const d = await fetchJson<BdnsDetall>(`${API}/convocatorias?vpd=GE&numConv=${codi}`);
    return d?.codigoBDNS ? d : null;
  } catch {
    return null;
  }
}

export async function detalls(
  codis: readonly string[],
  onProgress?: (done: number, total: number) => void
): Promise<(BdnsDetall | null)[]> {
  return pool(codis, 4, (c) => detall(c), { delayMs: 150, onProgress });
}
