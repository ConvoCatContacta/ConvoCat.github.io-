import { describe, expect, it } from 'vitest';
import { normalitzaNom, resolGeo, type GeoIndex } from './comarca.ts';

describe('normalitzaNom', () => {
  it('deshace el artículo invertido por coma que usa BDNS', () => {
    expect(normalitzaNom("BISBAL D'EMPORDÀ, LA")).toBe('bisbal d emporda');
    expect(normalitzaNom("la Bisbal d'Empordà")).toBe('bisbal d emporda');
  });

  it('cruza el mismo ente escrito "de" o "del"', () => {
    // BDNS escribe "DE PLA", el registro oficial "del Pla". Si la alternación del regex
    // probara "de" antes que "del" quedaría una "l" suelta y el cruce fallaría.
    expect(normalitzaNom("CONSELL COMARCAL DE PLA DE L'ESTANY")).toBe('pla de l estany');
    expect(normalitzaNom("Consell Comarcal del Pla de l'Estany")).toBe('pla de l estany');
  });

  it('quita prefijos en catalán y en castellano', () => {
    expect(normalitzaNom('AYUNTAMIENTO DE GIRONA')).toBe('girona');
    expect(normalitzaNom('Ajuntament de Girona')).toBe('girona');
    expect(normalitzaNom('DIPUTACIÓN PROVINCIAL DE GIRONA')).toBe('girona');
  });

  it('aplica los alias de municipios renombrados', () => {
    expect(normalitzaNom("AYUNTAMIENTO DE CASTELL-PLATJA D'ARO")).toBe(
      'castell d aro platja d aro i s agaro'
    );
    expect(normalitzaNom("Ajuntament de Castell d'Aro, Platja d'Aro i s'Agaró")).toBe(
      'castell d aro platja d aro i s agaro'
    );
  });

  it('tolera vacíos', () => {
    expect(normalitzaNom(null)).toBe('');
    expect(normalitzaNom('')).toBe('');
  });
});

const index: GeoIndex = {
  municipis: new Map([
    ['girona', { municipi: 'Girona', comarca: 'Gironès' }],
    ['bisbal d emporda', { municipi: "la Bisbal d'Empordà", comarca: 'Baix Empordà' }],
  ]),
  comarques: new Map([['pla de l estany', "Pla de l'Estany"]]),
};

describe('resolGeo', () => {
  it('resuelve municipio y su comarca', () => {
    expect(resolGeo(index, 'AYUNTAMIENTO DE GIRONA')).toEqual({
      nivell_local: 'municipi',
      comarca: 'Gironès',
      municipi: 'Girona',
    });
  });

  it('resuelve consell comarcal', () => {
    expect(resolGeo(index, "CONSELL COMARCAL DE PLA DE L'ESTANY")).toEqual({
      nivell_local: 'comarca',
      comarca: "Pla de l'Estany",
      municipi: null,
    });
  });

  it('una diputación no tiene comarca: cubre toda la provincia', () => {
    expect(resolGeo(index, 'DIPUTACIÓN PROVINCIAL DE GIRONA')).toEqual({
      nivell_local: 'provincia',
      comarca: null,
      municipi: null,
    });
    expect(resolGeo(index, 'SALUT PÚBLICA DE LA DIPUTACIÓ DE GIRONA (DIPSALUT)').nivell_local).toBe(
      'provincia'
    );
  });

  it('no confunde la capital con su provincia', () => {
    // "Girona" es a la vez provincia y municipio: el nivel provincial debe detectarse por
    // el nombre del ente ("diputació"/"provincial"), nunca por el topónimo a secas.
    expect(resolGeo(index, 'AYUNTAMIENTO DE GIRONA').nivell_local).toBe('municipi');
    expect(resolGeo(index, 'DIPUTACIÓ DE GIRONA').nivell_local).toBe('provincia');
  });

  it('usa el primer candidato que resuelve', () => {
    expect(resolGeo(index, 'ÒRGAN QUE NO EXISTEIX', "BISBAL D'EMPORDÀ, LA").comarca).toBe(
      'Baix Empordà'
    );
  });

  it('devuelve vacío cuando no hay nada que cruzar', () => {
    expect(resolGeo(index, null, undefined, 'ENS DESCONEGUT')).toEqual({
      nivell_local: null,
      comarca: null,
      municipi: null,
    });
  });
});
