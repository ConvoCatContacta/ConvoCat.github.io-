import type { Geo } from './comarca.ts';

/**
 * BDNS publica los entes locales en castellano, en mayúsculas y con el artículo invertido:
 * "AYUNTAMIENTO DE BISBAL D'EMPORDÀ, LA". En un lloc en català això no és presentable.
 *
 * Cuando el índice geográfico ha identificado el ente usamos su `nom_oficial`, que el registro
 * de entes locales ya publica bien escrito ("Ajuntament de la Bisbal d'Empordà", "Ajuntament
 * del Masnou", "Ajuntament de l'Escala"). Reconstruir el artículo y la contracción por nuestra
 * cuenta sería reinventar peor una gramática que la fuente ya tiene resuelta.
 *
 * Si el órgano no es el ayuntamiento sino un organismo suyo (un patronat, un institut
 * municipal, Dipsalut), se deja el nombre original: perder esa precisión sería peor que la
 * estética, porque el lector necesita saber quién convoca de verdad.
 */

const PROVINCIES = ['Barcelona', 'Girona', 'Lleida', 'Tarragona'];

export function nomOrganCatala(brut: string, geo: Geo | null): string {
  const net = brut.replace(/\s+/g, ' ').trim();

  const esAjuntament = /^(ayuntamiento|ajuntament)\b/i.test(net);
  const esConsell = /^(consell comarcal|consejo comarcal)\b/i.test(net);

  if ((esAjuntament || esConsell) && geo?.nom_oficial) return geo.nom_oficial;

  if (/^(diputaci[oó]n?|diputaci[oó])\b/i.test(net)) {
    const provincia = PROVINCIES.find((p) => new RegExp(p, 'i').test(net));
    if (provincia) return `Diputació de ${provincia}`;
  }

  return net;
}
