import { describe, expect, it } from 'vitest';
import { comarcaAmb, comarcaAmbArticle } from './comarques.ts';

describe('comarcaAmbArticle', () => {
  it('afegeix l\'article que el registre no guarda', () => {
    expect(comarcaAmbArticle('Gironès')).toBe('el Gironès');
    expect(comarcaAmbArticle('Selva')).toBe('la Selva');
    expect(comarcaAmbArticle('Anoia')).toBe("l'Anoia");
    expect(comarcaAmbArticle('Garrigues')).toBe('les Garrigues');
  });

  it('respecta les dues comarques sense article', () => {
    expect(comarcaAmbArticle('Osona')).toBe('Osona');
    expect(comarcaAmbArticle('Aran')).toBe('Aran');
  });
});

describe('comarcaAmb', () => {
  it('contrau de + el i a + el', () => {
    expect(comarcaAmb('de', 'Gironès')).toBe('del Gironès');
    expect(comarcaAmb('a', 'Gironès')).toBe('al Gironès');
    expect(comarcaAmb('de', "Pla de l'Estany")).toBe("del Pla de l'Estany");
  });

  it('no contrau davant de la, les ni l\'', () => {
    expect(comarcaAmb('a', 'Selva')).toBe('a la Selva');
    expect(comarcaAmb('de', 'Selva')).toBe('de la Selva');
    expect(comarcaAmb('a', 'Garrigues')).toBe('a les Garrigues');
    expect(comarcaAmb('a', 'Alt Empordà')).toBe("a l'Alt Empordà");
  });

  it('apostrofa "de" davant de vocal quan no hi ha article', () => {
    expect(comarcaAmb('de', 'Osona')).toBe("d'Osona");
    expect(comarcaAmb('a', 'Osona')).toBe('a Osona');
  });

  it('no inventa res per a una comarca que no conegui', () => {
    expect(comarcaAmb('a', 'Comarca Nova')).toBe('a Comarca Nova');
  });
});
