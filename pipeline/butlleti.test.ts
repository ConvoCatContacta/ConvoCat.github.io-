import { describe, expect, it } from 'vitest';
import { cosHtml, novetats } from './butlleti.ts';
import type { Convocatoria } from './types.ts';

const c = (id: string, estat: Convocatoria['estat'], titol = `Ajut ${id}`): Convocatoria => ({
  id, fonts: ['bdns'], codi_bdns: id, codi_raisc: null,
  titol, objecte: null, organ_convocant: 'Ajuntament de Girona',
  ambit: 'local', nivell_local: 'municipi', comarca: 'Gironès', municipi: 'Girona',
  tipus_beneficiari: [], concurrencia: true, import_total: null,
  data_inici: null, data_fi: '2026-12-01', termini_text: null,
  estat, confianca_termini: 'alta',
  url_oficial: 'https://exemple.cat', url_bases: null, seu_electronica: null, resum: null,
});

describe('novetats', () => {
  it('detecta les que s\'acaben d\'obrir', () => {
    expect(novetats([c('1', 'oberta')], [c('1', 'oberta'), c('2', 'oberta')]).map((n) => n.id))
      .toEqual(['2']);
  });

  it('compta com a novetat la que passa de propera a oberta', () => {
    // És nova per a qui la pot demanar, encara que ja fos al fitxer.
    expect(novetats([c('1', 'propera')], [c('1', 'oberta')]).map((n) => n.id)).toEqual(['1']);
  });

  it('no repeteix les que ja estaven obertes', () => {
    expect(novetats([c('1', 'oberta')], [c('1', 'oberta')])).toEqual([]);
  });

  it('ignora les que es tanquen o segueixen tancades', () => {
    expect(novetats([c('1', 'oberta')], [c('1', 'tancada')])).toEqual([]);
    expect(novetats([], [c('9', 'tancada')])).toEqual([]);
  });
});

describe('cosHtml', () => {
  it('enllaça cada convocatòria a la seva fitxa', () => {
    const html = cosHtml(novetats([], [c('925512', 'oberta')]));
    expect(html).toContain('/convocatoria/925512');
    expect(html).toContain('fins al 2026-12-01');
  });

  it('converteix els id del RAISC en una ruta vàlida', () => {
    const html = cosHtml([{ id: 'raisc:EN-25-022', titol: 'X', organ: 'Y', data_fi: null }]);
    expect(html).toContain('/convocatoria/raisc-EN-25-022');
    expect(html).not.toContain('raisc:EN');
  });

  it('escapa el text que ve de les fonts', () => {
    // Els títols venen de BDNS: no poden injectar marcatge al correu.
    const html = cosHtml([
      { id: '1', titol: '<script>alert(1)</script>', organ: 'A & B', data_fi: null },
    ]);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('A &amp; B');
  });

  it('repeteix l\'avís de no oficial', () => {
    const html = cosHtml([{ id: '1', titol: 'X', organ: 'Y', data_fi: null }]);
    expect(html).toContain('no és un web oficial');
  });
});
