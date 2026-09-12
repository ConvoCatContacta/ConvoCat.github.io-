import { describe, expect, it } from 'vitest';
import { calResum, hashFont, netejaParagraf, textFont } from './resum.ts';
import type { Convocatoria } from './types.ts';

const base: Convocatoria = {
  id: '123', fonts: ['bdns'], codi_bdns: '123', codi_raisc: null,
  titol: 'Ajuts a la rehabilitació de façanes',
  objecte: 'Subvencions per a obres de millora de l\'envolupant tèrmica',
  organ_convocant: 'Ajuntament de Girona',
  ambit: 'local', nivell_local: 'municipi', comarca: 'Gironès', municipi: 'Girona',
  tipus_beneficiari: ['Pimes i autònoms'], concurrencia: true, import_total: 50000,
  data_inici: '2026-09-01', data_fi: '2026-10-01', termini_text: null,
  estat: 'oberta', confianca_termini: 'alta',
  url_oficial: 'https://exemple.cat', url_bases: null, seu_electronica: null, resum: null,
};

describe('calResum', () => {
  it('només resumeix el que algú pot demanar ara o aviat', () => {
    expect(calResum({ ...base, estat: 'oberta' })).toBe(true);
    expect(calResum({ ...base, estat: 'propera' })).toBe(true);
    // Pagar per resumir 2.700 convocatòries tancades no aporta res a ningú.
    expect(calResum({ ...base, estat: 'tancada' })).toBe(false);
    expect(calResum({ ...base, estat: 'indeterminada' })).toBe(false);
  });
});

describe('hashFont', () => {
  it('no canvia si no canvia el text que entra al prompt', () => {
    // Si canviés, cada execució regeneraria els resums i el fitxer de dades no pararia mai quiet.
    const a = hashFont(base);
    expect(hashFont({ ...base, estat: 'propera', import_total: 999, data_fi: '2027-01-01' })).toBe(a);
  });

  it('canvia quan canvia qualsevol camp que el model llegeix', () => {
    const a = hashFont(base);
    expect(hashFont({ ...base, titol: 'Un altre títol' })).not.toBe(a);
    expect(hashFont({ ...base, objecte: 'Un altre objecte' })).not.toBe(a);
    expect(hashFont({ ...base, organ_convocant: 'Ajuntament de Salt' })).not.toBe(a);
    expect(hashFont({ ...base, tipus_beneficiari: ['Grans empreses'] })).not.toBe(a);
  });

  it('no confon dos camps concatenats amb un de sol', () => {
    const a = hashFont({ ...base, titol: 'ab', objecte: 'c' });
    const b = hashFont({ ...base, titol: 'a', objecte: 'bc' });
    expect(a).not.toBe(b);
  });
});

describe('textFont', () => {
  it('no inventa línies per als camps que no hi són', () => {
    const sense = textFont({ ...base, objecte: null, tipus_beneficiari: [] });
    expect(sense).not.toContain('Objecte');
    expect(sense).not.toContain('Tipus de beneficiari');
    expect(sense).toContain('Ajuts a la rehabilitació de façanes');
  });

  it('no cola imports ni terminis al prompt', () => {
    // El paràgraf explica què és i a qui s'adreça; les xifres i dates les pinta la fitxa a
    // partir dels camps oficials, on no hi ha cap model pel mig.
    const t = textFont(base);
    expect(t).not.toContain('50000');
    expect(t).not.toContain('2026-10-01');
  });
});

describe('netejaParagraf', () => {
  it('treu cometes i espais que el model pugui afegir', () => {
    expect(netejaParagraf('  "Un paràgraf."  ')).toBe('Un paràgraf.');
    expect(netejaParagraf('«Un paràgraf.»')).toBe('Un paràgraf.');
    expect(netejaParagraf('Una frase\n\namb salts.')).toBe('Una frase amb salts.');
  });
});
