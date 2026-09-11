import { describe, expect, it } from 'vitest';
import { nomOrganCatala } from './noms.ts';
import type { Geo } from './comarca.ts';

const geo = (p: Partial<Geo>): Geo => ({
  nivell_local: null, comarca: null, municipi: null, nom_oficial: null, ...p,
});

describe('nomOrganCatala', () => {
  it('fa servir el nom oficial del registre per als ajuntaments', () => {
    // BDNS escriu "AYUNTAMIENTO DE BISBAL D'EMPORDÀ, LA"; el registre ja té l'article al lloc.
    expect(
      nomOrganCatala("AYUNTAMIENTO DE BISBAL D'EMPORDÀ, LA", geo({
        municipi: "Bisbal d'Empordà", nom_oficial: "Ajuntament de la Bisbal d'Empordà",
      }))
    ).toBe("Ajuntament de la Bisbal d'Empordà");
  });

  it('respecta les contraccions que fa el registre', () => {
    expect(
      nomOrganCatala('AYUNTAMIENTO DE MASNOU, EL', geo({
        municipi: 'Masnou', nom_oficial: 'Ajuntament del Masnou',
      }))
    ).toBe('Ajuntament del Masnou');

    expect(
      nomOrganCatala('AYUNTAMIENTO DE ESCALA, LA', geo({
        municipi: 'Escala', nom_oficial: "Ajuntament de l'Escala",
      }))
    ).toBe("Ajuntament de l'Escala");
  });

  it('fa el mateix amb els consells comarcals', () => {
    expect(
      nomOrganCatala("CONSELL COMARCAL DE PLA DE L'ESTANY", geo({
        comarca: "Pla de l'Estany", nom_oficial: "Consell Comarcal del Pla de l'Estany",
      }))
    ).toBe("Consell Comarcal del Pla de l'Estany");
  });

  it('normalitza la diputació', () => {
    expect(nomOrganCatala('DIPUTACIÓN PROVINCIAL DE GIRONA', geo({ nivell_local: 'provincia' })))
      .toBe('Diputació de Girona');
  });

  it('respecta els organismes propis d\'una diputació', () => {
    // Dipsalut no és "la Diputació": reescriure-ho amagaria de qui ve realment l'ajut.
    expect(
      nomOrganCatala('SALUT PÚBLICA DE LA DIPUTACIÓ DE GIRONA (DIPSALUT)', geo({ nivell_local: 'provincia' }))
    ).toBe('SALUT PÚBLICA DE LA DIPUTACIÓ DE GIRONA (DIPSALUT)');
  });

  it('no toca un organisme municipal que no és l\'ajuntament', () => {
    expect(
      nomOrganCatala('PATRONAT MUNICIPAL D\'ESPORTS', geo({
        municipi: 'Girona', nom_oficial: 'Ajuntament de Girona',
      }))
    ).toBe("PATRONAT MUNICIPAL D'ESPORTS");
  });

  it('deixa intacte el que no ha pogut identificar', () => {
    expect(nomOrganCatala('AYUNTAMIENTO DE VILAFRANCA', geo({}))).toBe('AYUNTAMIENTO DE VILAFRANCA');
    expect(nomOrganCatala("DEPARTAMENT D'AGRICULTURA", null)).toBe("DEPARTAMENT D'AGRICULTURA");
  });
});
