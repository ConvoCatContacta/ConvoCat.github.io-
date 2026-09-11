import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Convocatoria } from '../../pipeline/types.ts';
import { llescaComarca } from './format.ts';

export type { Convocatoria };

const FITXER = join(process.cwd(), 'data', 'convocatories.json');

let cache: Convocatoria[] | null = null;

export function totes(): Convocatoria[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(readFileSync(FITXER, 'utf8')) as Convocatoria[];
  } catch {
    throw new Error(
      `No s'ha pogut llegir ${FITXER}. Executa "npm run ingest" abans de construir el lloc.`
    );
  }
  return cache;
}

export function meta(): { executat: string; total: number; obertes: number } {
  const brut = readFileSync(join(process.cwd(), 'data', 'meta.json'), 'utf8');
  return JSON.parse(brut) as { executat: string; total: number; obertes: number };
}

export function obertes(): Convocatoria[] {
  return totes()
    .filter((c) => c.estat === 'oberta')
    .sort((a, b) => (a.data_fi ?? '9999').localeCompare(b.data_fi ?? '9999'));
}

export type Comarca = { nom: string; llesca: string; total: number };

export function comarques(): Comarca[] {
  const compte = new Map<string, number>();
  for (const c of obertes()) {
    if (c.comarca) compte.set(c.comarca, (compte.get(c.comarca) ?? 0) + 1);
  }
  return [...compte.entries()]
    .map(([nom, total]) => ({ nom, llesca: llescaComarca(nom), total }))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'ca'));
}

export function beneficiaris(): string[] {
  const vistos = new Set<string>();
  for (const c of obertes()) for (const b of c.tipus_beneficiari) vistos.add(b);
  return [...vistos].sort((a, b) => a.localeCompare(b, 'ca'));
}

/** Versión ligera que viaja al navegador para los filtros del listado. */
export type Fitxa = {
  id: string;
  titol: string;
  organ: string;
  ambit: Convocatoria['ambit'];
  comarca: string | null;
  beneficiaris: string[];
  data_fi: string | null;
  import_total: number | null;
};

export function fitxes(): Fitxa[] {
  return obertes().map((c) => ({
    id: c.id,
    titol: c.titol,
    organ: c.organ_convocant,
    ambit: c.ambit,
    comarca: c.comarca,
    beneficiaris: c.tipus_beneficiari,
    data_fi: c.data_fi,
    import_total: c.import_total,
  }));
}
