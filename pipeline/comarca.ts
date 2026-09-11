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

  // Primer el tipus d'ens, i només després l'article: si es fa a l'inrevés, l'article invertit
  // de "AYUNTAMIENTO DE ESPLUGA DE FRANCOLÍ, L'" queda davant de tot ("l'ayuntamiento de...")
  // i ja no es reconeix el prefix.
  //
  // Alternacions ordenades de més llarga a més curta: en JS guanya la primera que encaixa,
  // així que posar "de" abans que "del" deixaria una "l" solta i trencaria el creuament.
  t = t.replace(
    /^(ajuntament|ayuntamiento|consell comarcal|consejo comarcal|diputacion provincial|diputacio provincial|diputacion|diputacio|mancomunitat|mancomunidad|consorci|consorcio|entitat municipal descentralitzada|conselh generau)\b/,
    ''
  );
  t = t.replace(/^\s*(de las|de los|de la|dels|des|del|de|d'|d)\b/, '').trim();

  const invertit = t.match(/^(.*),\s*(els|les|el|la|sa|es|l'|s')$/);
  // L'article apostrofat s'enganxa al topònim: "l'espluga", no "l' espluga", o la neteja
  // final el deixaria com una "l" solta.
  if (invertit) {
    const article = invertit[2]!;
    t = article.endsWith("'") ? `${article}${invertit[1]}` : `${article} ${invertit[1]}`;
  }

  t = t.replace(/^\s*(els|les|el|la|l'|sa|es)\b/, '');

  t = t.replace(/[^a-z0-9]+/g, ' ').trim();
  return ALIES[t] ?? t;
}

export type GeoIndex = {
  // `nom_oficial` es el nombre completo del ente tal como lo publica el registro
  // ("Ajuntament de la Bisbal d'Empordà"), ya con el artículo y la preposición contraída.
  // El campo `municipi` viene sin artículo ("Bisbal d'Empordà"), así que reconstruirlo a mano
  // sería reinventar peor una gramática que el propio registro ya ha resuelto.
  ens: Map<string, { municipi: string | null; comarca: string; nom_oficial: string; nivell: NivellLocal }>;
  comarques: Map<string, { comarca: string; nom_oficial: string }>;
};

export async function carregaGeoIndex(): Promise<GeoIndex> {
  const tipus = TIPUS_GOVERN.map((t) => `'${t.replace(/'/g, "''")}'`).join(',');
  const url =
    `${DATASET}?$select=codi_ens,nom_complert,municipi,comarca,codcomarca,provincia,nomtipus` +
    `&$where=${encodeURIComponent(`nomtipus IN (${tipus})`)}&$limit=5000`;
  const rows = await fetchJson<EnsRow[]>(url);

  const index: GeoIndex = { ens: new Map(), comarques: new Map() };

  for (const r of rows) {
    // Las 4 provincias comparten nombre normalizado con su capital ("girona" es provincia
    // y municipio), así que indexarlas haría que un ayuntamiento capital se clasificara
    // como diputación. El nivel provincial se detecta por el nombre del ente, no por tabla.
    if (r.nomtipus === 'Províncies') continue;

    if (r.nomtipus === 'Comarques') {
      // Las filas de comarca traen el nombre limpio en `comarca`; `nom_complert` es
      // "Consell Comarcal del ...". Indexamos los dos.
      if (!r.comarca || !r.nom_complert) continue;
      const valor = { comarca: r.comarca, nom_oficial: r.nom_complert };
      for (const k of [normalitzaNom(r.nom_complert), normalitzaNom(r.comarca)]) {
        if (k && !index.comarques.has(k)) index.comarques.set(k, valor);
      }
      continue;
    }

    if (!r.comarca || !r.nom_complert) continue;

    // Una mancomunitat, una EMD o l'Àrea Metropolitana porten al camp `municipi` el municipi
    // on tenen la seu. Indexar-les per aquest topònim segrestava el creuament de l'ajuntament:
    // "Ajuntament de Barcelona" resolia a "Àrea Metropolitana de Barcelona" i "Ajuntament de
    // Calaf" a "Mancomunitat de l'Alta Segarra". Només els municipis s'indexen pel topònim;
    // la resta, exclusivament pel seu nom complet.
    const esMunicipi = r.nomtipus === 'Municipis';
    const valor = {
      municipi: esMunicipi ? (r.municipi ?? null) : null,
      comarca: r.comarca,
      nom_oficial: r.nom_complert,
      nivell: (esMunicipi ? 'municipi' : 'altre') as NivellLocal,
    };

    const claus = esMunicipi
      ? [normalitzaNom(r.nom_complert), normalitzaNom(r.municipi)]
      : [normalitzaNom(r.nom_complert)];

    for (const k of claus) {
      if (k && !index.ens.has(k)) index.ens.set(k, valor);
    }
  }

  return index;
}

export type Geo = {
  nivell_local: NivellLocal | null;
  comarca: string | null;
  municipi: string | null;
  nom_oficial: string | null;
};

const BUIT: Geo = { nivell_local: null, comarca: null, municipi: null, nom_oficial: null };

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
      return { nivell_local: 'provincia', comarca: null, municipi: null, nom_oficial: null };
    }

    const com = index.comarques.get(clau);
    if (com) {
      return {
        nivell_local: 'comarca', comarca: com.comarca, municipi: null,
        nom_oficial: com.nom_oficial,
      };
    }

    const ens = index.ens.get(clau);
    if (ens) {
      return {
        nivell_local: ens.nivell, comarca: ens.comarca, municipi: ens.municipi,
        nom_oficial: ens.nom_oficial,
      };
    }
  }

  return BUIT;
}
