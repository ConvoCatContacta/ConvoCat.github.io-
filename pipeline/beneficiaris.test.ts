import { describe, expect, it } from 'vitest';
import { normalitzaBeneficiaris } from './beneficiaris.ts';

describe('normalitzaBeneficiaris', () => {
  it('unifica la versión castellana de BDNS y la catalana del RAISC', () => {
    // Sin esto el filtro del listado queda partido en dos por idioma.
    const deBdns = normalitzaBeneficiaris(['PYME Y PERSONAS FÍSICAS QUE DESARROLLAN ACTIVIDAD ECONÓMICA']);
    const deRaisc = normalitzaBeneficiaris(['PYME i Pers. físiques que desenvolupen activitat econòmica']);
    expect(deBdns).toEqual(['Pimes i autònoms']);
    expect(deRaisc).toEqual(deBdns);
  });

  it('separa las listas que el RAISC entrega en una sola cadena', () => {
    expect(
      normalitzaBeneficiaris([
        'Gran empresa; Persones jurídiques que no desenvolupen activitat econòmica',
      ])
    ).toEqual(['Entitats sense activitat econòmica', 'Grans empreses']);
  });

  it('no duplica cuando las dos fuentes dicen lo mismo', () => {
    expect(
      normalitzaBeneficiaris(['GRAN EMPRESA', 'Gran empresa'])
    ).toEqual(['Grans empreses']);
  });

  it('ordena de menor a mayor beneficiario', () => {
    expect(
      normalitzaBeneficiaris(['GRAN EMPRESA', 'PERSONAS FÍSICAS QUE NO DESARROLLAN ACTIVIDAD ECONÓMICA'])
    ).toEqual(['Persones físiques sense activitat econòmica', 'Grans empreses']);
  });

  it('conserva los valores desconocidos en vez de descartarlos', () => {
    expect(normalitzaBeneficiaris(['Categoria nova que no coneixem'])).toEqual([
      'Categoria nova que no coneixem',
    ]);
  });

  it('tolera cadenas vacías', () => {
    expect(normalitzaBeneficiaris([''])).toEqual([]);
    expect(normalitzaBeneficiaris([])).toEqual([]);
  });
});
