/**
 * Les URL de les fitxes venen de BDNS i del RAISC, que són sistemes que no controlem, i es
 * pinten directament com a `href`. Sense validar l'esquema, el dia que una font publiqui un
 * `javascript:` el tindrem viu al nostre lloc: és una frontera de confiança, no un detall.
 *
 * A la ingesta del 2026-09-12 hi havia 349 valors que no eren URL http(s): adreces de correu
 * al camp de seu electrònica, rutes relatives que resolien contra el nostre propi domini,
 * text lliure ("Seu electrònica Ministeri") i enllaços copiats des d'un visor de PDF.
 */

/** Un amfitrió sense esquema: "www.sitges.cat", "diputaciodetarragona.cat/ebop?op=dwn". */
const AMFITRIO_NU = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(?::\d+)?(?:[/?#]|$)/i;

/** Els PDF oberts amb l'extensió del Chrome deixen l'URL real darrere del prefix. */
const EXTENSIO = /^chrome-extension:\/\/[a-z]+\/(https?:\/\/.+)$/i;

/**
 * Retorna una URL http(s) segura, o null si no se'n pot obtenir cap.
 *
 * Només repara el que es pot reparar sense endevinar: treu l'embolcall de l'extensió del
 * Chrome i posa `https://` a un amfitrió que ja ho és. La resta es descarta: un enllaç trencat
 * és millor que un enllaç a un lloc que no és el que diu.
 */
export function urlSegura(brut: string | null | undefined): string | null {
  if (!brut) return null;
  const t = brut.trim();
  if (!t || /\s/.test(t)) return null;

  const desembolicat = t.match(EXTENSIO);
  if (desembolicat) return desembolicat[1]!;

  const esquema = t.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (esquema) {
    // Qualsevol altre esquema es descarta, inclosos javascript:, data:, file: i mailto:.
    // Una adreça de correu no és una seu electrònica.
    return /^https?$/i.test(esquema[1]!) ? t : null;
  }

  // Sense esquema. Una ruta relativa ("/bases-...") resoldria contra el nostre domini i
  // semblaria un enllaç trencat nostre, així que tampoc val.
  if (t.startsWith('/') || t.includes('@')) return null;
  if (!AMFITRIO_NU.test(t)) return null;

  return `https://${t}`;
}
