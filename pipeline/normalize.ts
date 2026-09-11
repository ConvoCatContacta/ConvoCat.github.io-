import type { BdnsDetall } from './sources/bdns.ts';
import { codiBdns, type RaiscRow } from './sources/raisc.ts';
import { resolGeo, type GeoIndex } from './comarca.ts';
import { normalitzaBeneficiaris } from './beneficiaris.ts';
import { nomOrganCatala } from './noms.ts';
import type { Convocatoria, Estat } from './types.ts';

export type EstatDerivat = { estat: Estat; confianca_termini: 'alta' | 'baixa' };

/**
 * Deriva el estado a partir de las fechas, y solo de las fechas.
 *
 * BDNS publica un campo `abierto` que NO es fiable: el 2026-09-11 devolvía `abierto:false`
 * en convocatorias cuya propia `fechaFinSolicitud` era el 2026-09-15, coincidiendo además
 * con la fecha que daba el RAISC. Usarlo como fuente de verdad esconde convocatorias vivas
 * y saca como abiertas concesiones directas ya cerradas.
 */
export function derivaEstat(
  dates: { dataInici: string | null; dataFi: string | null; terminiText: string | null },
  avui: string
): EstatDerivat {
  const { dataInici, dataFi, terminiText } = dates;

  if (dataFi) {
    if (dataFi.slice(0, 10) < avui) return { estat: 'tancada', confianca_termini: 'alta' };
    if (dataInici && dataInici.slice(0, 10) > avui) {
      return { estat: 'propera', confianca_termini: 'alta' };
    }
    return { estat: 'oberta', confianca_termini: 'alta' };
  }

  // Sin fecha estructurada solo queda el plazo en texto libre ("10 de setembre de 2027").
  // Convertirlo en una fecha dura sería inventar: se muestra literal y se marca como dudoso.
  if (terminiText) return { estat: 'indeterminada', confianca_termini: 'baixa' };

  return { estat: 'indeterminada', confianca_termini: 'baixa' };
}

const iso = (d: string | null | undefined): string | null => (d ? d.slice(0, 10) : null);

const net = (s: string | null | undefined): string | null => {
  const t = s?.replace(/\s+/g, ' ').trim();
  return t ? t : null;
};

function ambitDeNivel(nivel1: string | undefined): Convocatoria['ambit'] {
  const n = (nivel1 ?? '').toUpperCase();
  if (n.includes('AUTONOM')) return 'autonomic';
  if (n.includes('LOCAL')) return 'local';
  return 'estatal';
}

export function desDeBdns(d: BdnsDetall, geo: GeoIndex, avui: string): Convocatoria | null {
  const codi = String(d.codigoBDNS ?? '').trim();
  const titol = net(d.descripcionLeng) ?? net(d.descripcion);
  if (!codi || !titol) return null;

  const ambit = ambitDeNivel(d.organo?.nivel1);
  const g = ambit === 'local' ? resolGeo(geo, d.organo?.nivel3, d.organo?.nivel2) : null;

  const { estat, confianca_termini } = derivaEstat(
    { dataInici: iso(d.fechaInicioSolicitud), dataFi: iso(d.fechaFinSolicitud), terminiText: net(d.textFin) },
    avui
  );

  return {
    id: codi,
    fonts: ['bdns'],
    codi_bdns: codi,
    codi_raisc: null,
    titol,
    objecte: net(d.descripcionBasesReguladoras),
    organ_convocant: nomOrganCatala(
      net(d.organo?.nivel3) ?? net(d.organo?.nivel2) ?? 'Desconegut',
      g
    ),
    ambit,
    nivell_local: g?.nivell_local ?? null,
    comarca: g?.comarca ?? null,
    municipi: g?.municipi ?? null,
    tipus_beneficiari: normalitzaBeneficiaris(
      (d.tiposBeneficiarios ?? []).map((b) => b.descripcion).filter(Boolean)
    ),
    concurrencia: /concurrencia/i.test(d.tipoConvocatoria ?? ''),
    import_total: typeof d.presupuestoTotal === 'number' ? d.presupuestoTotal : null,
    data_inici: iso(d.fechaInicioSolicitud),
    data_fi: iso(d.fechaFinSolicitud),
    termini_text: net(d.textFin),
    estat,
    confianca_termini,
    url_oficial: `https://www.infosubvenciones.es/bdnstrans/GE/ca/convocatoria/${codi}`,
    url_bases: net(d.urlBasesReguladoras),
    seu_electronica: net(d.sedeElectronica),
    resum: null,
  };
}

export function desDeRaisc(r: RaiscRow, geo: GeoIndex, avui: string): Convocatoria | null {
  const titol = net(r.t_tol_convocat_ria_catal);
  if (!r.codi_raisc || !titol) return null;

  const esLocal = (r.administraci_ ?? '').startsWith('Local');
  const g = esLocal
    ? resolGeo(geo, r.entitat_oo_aa_o_departament_1, r.departament_o_entitat_local_d_adscripci_)
    : null;

  const dataFi = iso(r.data_fi_termini_presentaci_sol_licitud);
  const { estat, confianca_termini } = derivaEstat(
    { dataInici: null, dataFi, terminiText: null },
    avui
  );

  const bdns = codiBdns(r);
  const importTotal = Number(r.import_total_convocat_ria);

  return {
    id: bdns ?? `raisc:${r.codi_raisc}`,
    fonts: ['raisc'],
    codi_bdns: bdns,
    codi_raisc: r.codi_raisc,
    titol,
    objecte: net(r.objecte_de_la_convocat_ria),
    organ_convocant: nomOrganCatala(net(r.entitat_oo_aa_o_departament_1) ?? 'Desconegut', g),
    ambit: esLocal ? 'local' : 'autonomic',
    nivell_local: g?.nivell_local ?? null,
    comarca: g?.comarca ?? null,
    municipi: g?.municipi ?? null,
    tipus_beneficiari: normalitzaBeneficiaris(
      r.tipus_de_beneficiaris ? [r.tipus_de_beneficiaris] : []
    ),
    concurrencia: r.tipus_de_convocat_ria_codi === 'O',
    import_total: Number.isFinite(importTotal) && importTotal > 0 ? importTotal : null,
    data_inici: null,
    data_fi: dataFi,
    termini_text: null,
    estat,
    confianca_termini,
    url_oficial:
      net(r.url_diari_oficial) ??
      net(r.url_catala_bases_reg) ??
      (bdns ? `https://www.infosubvenciones.es/bdnstrans/GE/ca/convocatoria/${bdns}` : ''),
    url_bases: net(r.url_catala_bases_reg),
    seu_electronica: net(r.seu_electr_nica),
    resum: null,
  };
}
