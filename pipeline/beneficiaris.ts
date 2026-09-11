/**
 * Los tipos de beneficiario llegan en dos idiomas y dos formatos: BDNS los da en castellano y
 * en mayúsculas ("PYME Y PERSONAS FÍSICAS QUE DESARROLLAN ACTIVIDAD ECONÓMICA") y el RAISC en
 * catalán abreviado y a veces varios en una sola cadena separados por punto y coma.
 *
 * Son 11 variantes que describen 4 categorías. Sin unificarlas el filtro del listado queda
 * roto: quien filtre por la versión castellana no ve las catalanas, y viceversa.
 */

const FISIQUES_SENSE = 'Persones físiques sense activitat econòmica';
const ENTITATS_SENSE = 'Entitats sense activitat econòmica';
const PIMES = 'Pimes i autònoms';
const GRANS = 'Grans empreses';

const EQUIVALENCIES: Record<string, string> = {
  'personas fisicas que no desarrollan actividad economica': FISIQUES_SENSE,
  'persones fisiques que no desenvolupen activitat economica': FISIQUES_SENSE,
  'personas juridicas que no desarrollan actividad economica': ENTITATS_SENSE,
  'persones juridiques que no desenvolupen activitat economica': ENTITATS_SENSE,
  'pyme y personas fisicas que desarrollan actividad economica': PIMES,
  'pyme i pers fisiques que desenvolupen activitat economica': PIMES,
  'gran empresa': GRANS,
};

/** Orden estable y con sentido para el lector, de menor a mayor tamaño de beneficiario. */
const ORDRE = [FISIQUES_SENSE, ENTITATS_SENSE, PIMES, GRANS];

function clau(brut: string): string {
  return brut
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[.;]/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalitzaBeneficiaris(brut: readonly string[]): string[] {
  const vistos = new Set<string>();

  for (const entrada of brut) {
    for (const tros of entrada.split(';')) {
      const net = tros.trim();
      if (!net) continue;
      // Si aparece un valor que no conocemos lo conservamos tal cual: perder información
      // sería peor que mostrar una etiqueta fea.
      vistos.add(EQUIVALENCIES[clau(net)] ?? net);
    }
  }

  return [...vistos].sort((a, b) => {
    const ia = ORDRE.indexOf(a);
    const ib = ORDRE.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, 'ca');
  });
}
