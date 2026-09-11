import { fetchJson } from './http.ts';
import type { NivellLocalSchema } from './types.ts';
import type { z } from 'zod';

type NivellLocal = z.infer<typeof NivellLocalSchema>;

const DATASET = 'https://analisi.transparenciacatalunya.cat/resource/6nei-4b44.json';

/**
 * El dataset mezcla 11.769 entidades de todo tipo, incluidos 6.179 "Nuclis" y 3.909
 * "Entitats de població" que provocan falsos positivos al cruzar por nombre.
 * Solo nos interesan los niveles de gobierno.
 */
const TIPUS_GOVERN = [
  'Municipis',
  'Comarques',
  'Províncies',
  'Entitats municipals descentralitzades',
  'Mancomunitats',
  'Entitats metropolitanes',
] as const;

type EnsRow = {
  codi_ens?: string;
  nom_complert?: string;
  municipi?: string;
  comarca?: string;
  codcomarca?: string;
  provincia?: string;
  nomtipus?: string;
};

/**
 * BDNS publica algunos entes con un nombre que no coincide con el oficial del registro.
 * Son casos contados y se resuelven a mano: normalizado BDNS -> normalizado oficial.
 */
const ALIES: Record<string, string> = {
  'castell platja d aro': 'castell d aro platja d aro i s agaro',
  'roda de bara': 'roda de bera',
  'calonge': 'calonge i sant antoni',
  'brunyola': 'brunyola i sant marti sapresa',
};

/** "BISBAL D'EMPORDÀ, LA" -> "la bisbal d'empordà" -> "bisbal d emporda" */
export function normalitzaNom(raw: string | null | undefined): string {
  if (!raw) return '';
  let t = String(raw)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

  const invertit = t.match(/^(.*),\s*(els|les|el|la|sa|es|l'|s')$/);
  if (invertit) t = `${invertit[2]} ${invertit[1]}`;

  // Alternaciones ordenadas de más larga a más corta: en JS gana la primera que encaja,
  // así que poner "de" antes que "del" dejaría una "l" suelta y rompería el cruce.
  t = t.replace(
    /^(ajuntament|ayuntamiento|consell comarcal|consejo comarcal|diputacion provincial|diputacio provincial|diputacion|diputacio|mancomunitat|mancomunidad|consorci|consorcio|entitat municipal descentralitzada|conselh generau)\b/,
    ''
  );
  t = t.replace(/^\s*(de las|de los|de la|dels|des|del|de|d'|d)\b/, '');
  t = t.replace(/^\s*(els|les|el|la|l'|sa|es)\b/, '');

  t = t.replace(/[^a-z0-9]+/g, ' ').trim();
  return ALIES[t] ?? t;
}

export type GeoIndex = {
  municipis: Map<string, { municipi: string; comarca: string }>;
  comarques: Map<string, string>;
};

export async function carregaGeoIndex(): Promise<GeoIndex> {
  const tipus = TIPUS_GOVERN.map((t) => `'${t.replace(/'/g, "''")}'`).join(',');
  const url =
    `${DATASET}?$select=codi_ens,nom_complert,municipi,comarca,codcomarca,provincia,nomtipus` +
    `&$where=${encodeURIComponent(`nomtipus IN (${tipus})`)}&$limit=5000`;
  const rows = await fetchJson<EnsRow[]>(url);

  const index: GeoIndex = { municipis: new Map(), comarques: new Map() };

  for (const r of rows) {
    // Las 4 provincias comparten nombre normalizado con su capital ("girona" es provincia
    // y municipio), así que indexarlas haría que un ayuntamiento capital se clasificara
    // como diputación. El nivel provincial se detecta por el nombre del ente, no por tabla.
    if (r.nomtipus === 'Províncies') continue;

    if (r.nomtipus === 'Comarques') {
      // Las filas de comarca traen el nombre limpio en `comarca`; `nom_complert` es
      // "Consell Comarcal del ...". Indexamos los dos.
      if (!r.comarca) continue;
      for (const k of [normalitzaNom(r.nom_complert), normalitzaNom(r.comarca)]) {
        if (k && !index.comarques.has(k)) index.comarques.set(k, r.comarca);
      }
      continue;
    }

    if (!r.comarca || !r.municipi) continue;
    for (const k of [normalitzaNom(r.nom_complert), normalitzaNom(r.municipi)]) {
      if (k && !index.municipis.has(k)) {
        index.municipis.set(k, { municipi: r.municipi, comarca: r.comarca });
      }
    }
  }

  return index;
}

export type Geo = { nivell_local: NivellLocal | null; comarca: string | null; municipi: string | null };

const BUIT: Geo = { nivell_local: null, comarca: null, municipi: null };

/**
 * Resuelve nivel administrativo y comarca a partir de los nombres del órgano convocante.
 * Se le pasan varios candidatos (p. ej. organo.nivel3 y organo.nivel2 de BDNS) y gana el primero.
 *
 * Una diputación no tiene comarca: cubre toda la provincia. Devolver null ahí es la
 * respuesta correcta, no un fallo de cruce.
 */
export function resolGeo(index: GeoIndex, ...candidats: (string | null | undefined)[]): Geo {
  for (const candidat of candidats) {
    if (!candidat) continue;
    const clau = normalitzaNom(candidat);
    if (!clau) continue;

    if (/diputaci|provincial/i.test(candidat)) {
      return { nivell_local: 'provincia', comarca: null, municipi: null };
    }

    const comarca = index.comarques.get(clau);
    if (comarca) return { nivell_local: 'comarca', comarca, municipi: null };

    const muni = index.municipis.get(clau);
    if (muni) return { nivell_local: 'municipi', comarca: muni.comarca, municipi: muni.municipi };
  }

  return BUIT;
}
