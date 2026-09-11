import { fetchJson, pool, sleep } from '../http.ts';

const API = 'https://www.infosubvenciones.es/bdnstrans/api';

/**
 * Nodos raíz del árbol de órganos de BDNS que corresponden a Catalunya:
 * la comunidad autónoma y las cuatro provincias del nivel local.
 */
const ARRELS_CATALUNYA = { A: ['CATALUÑA'], L: ['BARCELONA', 'GIRONA', 'LLEIDA', 'TARRAGONA'] };

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

/**
 * Devuelve los ids de órgano de Catalunya.
 *
 * El filtro `regiones=51` parece el camino obvio y es una trampa: filtra por la región
 * declarada en la convocatoria, que la mayoría de convocatorias de la Generalitat no
 * rellena. Medido el 2026-09-11, `regiones=51` devolvía 1.826 convocatorias en 12 meses
 * y perdía las 177 que el RAISC daba por abiertas; por órganos salen 5.805 y recupera 160.
 */
export async function organsCatalunya(): Promise<number[]> {
  const ids: number[] = [];

  for (const [idAdmon, arrels] of Object.entries(ARRELS_CATALUNYA)) {
    const arbre = await fetchJson<NodeOrgan[]>(`${API}/organos?vpd=GE&idAdmon=${idAdmon}`);
    for (const node of arbre) {
      if (!arrels.includes(node.descripcion.trim().toUpperCase())) continue;
      // El id del nodo padre no es aceptado por `busqueda`: hay que enumerar las hojas.
      for (const fill of node.children ?? []) ids.push(fill.id);
    }
    await sleep(250);
  }

  if (!ids.length) throw new Error('BDNS: no se ha encontrado ningún órgano de Catalunya');
  return ids;
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
  organs: readonly number[],
  rang: { desde: string; fins: string }
): Promise<BdnsItem[]> {
  const vistos = new Map<string, BdnsItem>();
  const desde = ddmmyyyy(rang.desde);
  const fins = ddmmyyyy(rang.fins);

  for (const lot of lots(organs, ORGANS_PER_LOT)) {
    for (let page = 0; ; page++) {
      const url =
        `${API}/convocatorias/busqueda?vpd=GE&pageSize=1000&page=${page}` +
        `&fechaDesde=${desde}&fechaHasta=${fins}&organos=${lot.join(',')}`;
      const res = await fetchJson<{ content?: BdnsItem[]; last?: boolean }>(url);
      const content = res.content ?? [];
      for (const c of content) vistos.set(String(c.numeroConvocatoria), c);
      if (res.last || !content.length) break;
      await sleep(250);
    }
    await sleep(250);
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
