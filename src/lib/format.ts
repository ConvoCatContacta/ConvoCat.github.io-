import { IDIOMA_PER_DEFECTE, type Idioma } from '../i18n/textos.ts';

/**
 * Une una ruta con el `base` de Astro y el prefijo de idioma. Nunca escribas rutas internas a
 * mano: el sitio vive bajo una subruta en GitHub Pages, pasará a la raíz cuando haya dominio
 * propio, y además ahora cada idioma cuelga de su propio prefijo.
 */
export function ruta(cami: string, idioma: Idioma = IDIOMA_PER_DEFECTE): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const prefix = idioma === IDIOMA_PER_DEFECTE ? '' : `/${idioma}`;
  const net = cami.replace(/^\/+/, '');
  return net ? `${base}${prefix}/${net}` : `${base}${prefix}/`;
}

/** Los ids del RAISC son del tipo "raisc:6100-26-011": los dos puntos no valen ni en una URL
 *  ni en un nombre de fichero de Windows, donde se genera el sitio. Los de BDNS son numéricos,
 *  así que no hay riesgo de colisión al sustituirlos. */
export function llescaId(id: string): string {
  return id.replace(/[^A-Za-z0-9._-]+/g, '-');
}

export function llescaComarca(comarca: string): string {
  return comarca
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const MESOS: Record<Idioma, string[]> = {
  ca: ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

export function dataLlarga(iso: string | null, idioma: Idioma = IDIOMA_PER_DEFECTE): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  const mes = MESOS[idioma][m - 1]!;

  if (idioma === 'en') return `${d} ${mes} ${y}`;
  // En català la preposició s'apostrofa davant de vocal: d'abril, d'agost, d'octubre.
  // El castellà no ho fa mai: "de agosto", no "d'agosto".
  const prep = idioma === 'ca' && /^[aeiou]/.test(mes) ? "d'" : 'de ';
  return `${d} ${prep}${mes} de ${y}`;
}

export function diesFinsA(iso: string | null, avui: string): number | null {
  if (!iso) return null;
  const fi = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  const ara = Date.parse(`${avui.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(fi) || Number.isNaN(ara)) return null;
  return Math.round((fi - ara) / 86_400_000);
}

/** Franja de urgencia, para que el color no se decida en cada plantilla por su cuenta. */
export function urgencia(dies: number | null): 'urgent' | 'aviat' | 'tranquil' | 'sense' {
  if (dies === null) return 'sense';
  if (dies <= 7) return 'urgent';
  if (dies <= 21) return 'aviat';
  return 'tranquil';
}

const LOCALE: Record<Idioma, string> = { ca: 'ca-ES', es: 'es-ES', en: 'en-GB' };

export function importLlegible(
  import_total: number | null,
  idioma: Idioma = IDIOMA_PER_DEFECTE
): string | null {
  if (import_total === null || import_total <= 0) return null;
  return new Intl.NumberFormat(LOCALE[idioma], {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(import_total);
}
