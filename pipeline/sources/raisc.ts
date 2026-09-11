import { fetchJson } from '../http.ts';

const DATASET = 'https://analisi.transparenciacatalunya.cat/resource/khxn-nv6a.json';

export type RaiscRow = {
  codi_raisc: string;
  codi_bdns?: string;
  entitat_oo_aa_o_departament?: string;
  entitat_oo_aa_o_departament_1?: string;
  tipus_de_convocat_ria_codi?: string;
  tipus_de_convocat_ria?: string;
  any_de_la_convocat_ria?: string;
  t_tol_convocat_ria_catal?: string;
  objecte_de_la_convocat_ria?: string;
  url_diari_oficial?: string;
  url_catala_bases_reg?: string;
  seu_electr_nica?: string;
  tipus_de_beneficiaris?: string;
  import_total_convocat_ria?: string;
  data_inici_presentaci_sol?: string;
  data_fi_termini_presentaci_sol_licitud?: string;
  administraci_?: string;
  departament_o_entitat_local_d_adscripci_?: string;
};

/** El literal "No enviat" aparece como valor en `codi_bdns` y no es un código. */
export function codiBdns(row: RaiscRow): string | null {
  const c = row.codi_bdns?.trim();
  return c && c !== 'No enviat' ? c : null;
}

async function consulta(where: string, limit = 5000): Promise<RaiscRow[]> {
  const url = `${DATASET}?$where=${encodeURIComponent(where)}&$limit=${limit}&$order=codi_raisc`;
  return fetchJson<RaiscRow[]>(url);
}

/**
 * Convocatorias con plazo vivo.
 *
 * Dos filtros que no son opcionales:
 * - `tipus_de_convocat_ria_codi='O'` (concurrencia). El 67% del RAISC son subvenciones
 *   directas nominativas ya adjudicadas, sin plazo: ruido puro para un radar.
 * - `data_fi_termini_presentaci_sol_licitud`, que es un timestamp real. El campo
 *   `data_fi_presentaci_sol` es texto dd/mm/yyyy y no se puede filtrar ni ordenar.
 */
export async function convocatoriesObertes(avui: string): Promise<RaiscRow[]> {
  return consulta(
    `tipus_de_convocat_ria_codi='O' AND data_fi_termini_presentaci_sol_licitud >= '${avui}'`
  );
}

/** Convocatorias recientes aunque el plazo ya haya vencido, para detectar cierres y cambios. */
export async function convocatoriesRecents(desde: string): Promise<RaiscRow[]> {
  return consulta(
    `tipus_de_convocat_ria_codi='O' AND data_fi_termini_presentaci_sol_licitud >= '${desde}'`
  );
}
