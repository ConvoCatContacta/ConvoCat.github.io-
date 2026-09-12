import { describe, expect, it } from 'vitest';
import { derivaEstat } from './normalize.ts';
import { codiBdns } from './sources/raisc.ts';
import { dedupe, fusiona } from './dedupe.ts';
import type { Convocatoria } from './types.ts';

const AVUI = '2026-09-11';

describe('derivaEstat', () => {
  it('abierta cuando el plazo aún no ha vencido', () => {
    expect(derivaEstat({ dataInici: '2026-07-29', dataFi: '2026-09-15', terminiText: null }, AVUI))
      .toEqual({ estat: 'oberta', confianca_termini: 'alta' });
  });

  it('cerrada cuando ya ha vencido', () => {
    expect(derivaEstat({ dataInici: null, dataFi: '2026-09-10', terminiText: null }, AVUI))
      .toEqual({ estat: 'tancada', confianca_termini: 'alta' });
  });

  it('abierta el mismo día en que vence', () => {
    expect(derivaEstat({ dataInici: null, dataFi: AVUI, terminiText: null }, AVUI).estat)
      .toBe('oberta');
  });

  it('próxima cuando el plazo todavía no ha empezado', () => {
    expect(derivaEstat({ dataInici: '2026-10-01', dataFi: '2026-11-30', terminiText: null }, AVUI)
      .estat).toBe('propera');
  });

  it('indeterminada y poco fiable si solo hay plazo en texto libre', () => {
    expect(derivaEstat({ dataInici: null, dataFi: null, terminiText: '10 de setembre de 2027' }, AVUI))
      .toEqual({ estat: 'indeterminada', confianca_termini: 'baixa' });
  });

  it('acepta timestamps completos, no solo fechas', () => {
    expect(derivaEstat(
      { dataInici: null, dataFi: '2026-09-15T00:00:00.000', terminiText: null }, AVUI
    ).estat).toBe('oberta');
  });
});

describe('codiBdns', () => {
  it('trata el literal "No enviat" como ausencia de código', () => {
    expect(codiBdns({ codi_raisc: 'x', codi_bdns: 'No enviat' })).toBeNull();
    expect(codiBdns({ codi_raisc: 'x', codi_bdns: '921121' })).toBe('921121');
    expect(codiBdns({ codi_raisc: 'x' })).toBeNull();
  });
});

const base: Convocatoria = {
  id: '921121', fonts: ['bdns'], codi_bdns: '921121', codi_raisc: null,
  titol: "Ajuts a la contractació", objecte: null, organ_convocant: 'SOC',
  ambit: 'autonomic', nivell_local: null, comarca: null, municipi: null,
  tipus_beneficiari: ['PIME'], concurrencia: true, import_total: 1000,
  data_inici: '2026-07-29', data_fi: '2026-09-15', termini_text: null,
  estat: 'oberta', confianca_termini: 'alta',
  url_oficial: 'https://example.test/921121', url_bases: null, seu_electronica: null,
  resum: null,
};

const delRaisc: Convocatoria = {
  ...base,
  id: '921121', fonts: ['raisc'], codi_raisc: '6100-26-011',
  titol: 'Resolucio per la qual saprova', // acentos comidos, típico del RAISC
  comarca: 'Segrià', municipi: 'Lleida', nivell_local: 'municipi',
  import_total: 999, url_bases: 'https://example.test/bases',
};

describe('fusiona', () => {
  it('conserva el título limpio de BDNS frente al degradado del RAISC', () => {
    expect(fusiona(base, delRaisc).titol).toBe('Ajuts a la contractació');
  });

  it('toma del RAISC la atribución territorial que BDNS no resuelve', () => {
    const m = fusiona(base, delRaisc);
    expect(m.comarca).toBe('Segrià');
    expect(m.municipi).toBe('Lleida');
  });

  it('deja mandar a BDNS en importe y marca las dos fuentes', () => {
    const m = fusiona(base, delRaisc);
    expect(m.import_total).toBe(1000);
    expect(m.fonts).toEqual(['bdns', 'raisc']);
    expect(m.codi_raisc).toBe('6100-26-011');
  });

  it('usa la fecha del RAISC cuando BDNS no tiene ninguna', () => {
    const senseData: Convocatoria = {
      ...base, data_fi: null, termini_text: 'quan toqui',
      estat: 'indeterminada', confianca_termini: 'baixa',
    };
    const m = fusiona(senseData, delRaisc);
    expect(m.data_fi).toBe('2026-09-15');
    expect(m.estat).toBe('oberta');
    expect(m.confianca_termini).toBe('alta');
  });
});

describe('dedupe', () => {
  it('une por codi_bdns sin duplicar', () => {
    const out = dedupe([base], [delRaisc]);
    expect(out).toHaveLength(1);
    expect(out[0]!.fonts).toEqual(['bdns', 'raisc']);
  });

  it('mantiene las del RAISC que BDNS no tiene', () => {
    const soloRaisc: Convocatoria = { ...delRaisc, id: 'raisc:9999', codi_bdns: null };
    const out = dedupe([base], [soloRaisc]);
    expect(out).toHaveLength(2);
  });
});
