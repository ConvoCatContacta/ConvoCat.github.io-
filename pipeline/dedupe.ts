import type { Convocatoria } from './types.ts';

const prefereix = <T>(a: T | null, b: T | null): T | null => (a !== null && a !== '' ? a : b);

/**
 * Fusiona la misma convocatoria vista en las dos fuentes.
 *
 * Reparto de autoridad, medido contra los datos reales:
 * - BDNS manda en fechas, importe, sede electrónica y beneficiarios: son campos
 *   estructurados y completos.
 * - BDNS manda también en el título. El del RAISC llega con acentos y apóstrofos comidos
 *   ("Resolucio per la qual saprova"), mientras que `descripcionLeng` viene limpio en catalán.
 * - RAISC manda en la atribución territorial, que es su punto fuerte y donde BDNS solo da
 *   el nombre del órgano.
 */
export function fusiona(bdns: Convocatoria, raisc: Convocatoria): Convocatoria {
  return {
    ...bdns,
    fonts: ['bdns', 'raisc'],
    codi_raisc: raisc.codi_raisc,
    titol: prefereix(bdns.titol, raisc.titol) ?? raisc.titol,
    objecte: prefereix(bdns.objecte, raisc.objecte),
    nivell_local: bdns.nivell_local ?? raisc.nivell_local,
    comarca: bdns.comarca ?? raisc.comarca,
    municipi: bdns.municipi ?? raisc.municipi,
    tipus_beneficiari: bdns.tipus_beneficiari.length
      ? bdns.tipus_beneficiari
      : raisc.tipus_beneficiari,
    import_total: bdns.import_total ?? raisc.import_total,
    url_bases: prefereix(bdns.url_bases, raisc.url_bases),
    seu_electronica: prefereix(bdns.seu_electronica, raisc.seu_electronica),
    // Si BDNS no trae fecha de fin pero el RAISC sí, el estado del RAISC es el bueno:
    // una fecha real siempre gana a un plazo indeterminado.
    ...(bdns.data_fi === null && raisc.data_fi !== null
      ? {
          data_fi: raisc.data_fi,
          estat: raisc.estat,
          confianca_termini: raisc.confianca_termini,
        }
      : {}),
  };
}

/** Une las dos fuentes por `codi_bdns`, que el RAISC publica en cada fila. */
export function dedupe(
  deBdns: readonly Convocatoria[],
  deRaisc: readonly Convocatoria[]
): Convocatoria[] {
  const perCodi = new Map<string, Convocatoria>();
  for (const c of deBdns) perCodi.set(c.id, c);

  for (const r of deRaisc) {
    const existent = r.codi_bdns ? perCodi.get(r.codi_bdns) : undefined;
    if (existent) {
      perCodi.set(existent.id, fusiona(existent, r));
    } else {
      perCodi.set(r.id, r);
    }
  }

  return [...perCodi.values()];
}
