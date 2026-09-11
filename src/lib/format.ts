/** Une una ruta con el `base` de Astro. Nunca escribas rutas internas a mano: el sitio vive
 *  bajo una subruta en GitHub Pages y pasará a la raíz cuando haya dominio propio. */
export function ruta(cami: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const net = cami.replace(/^\/+/, '');
  return net ? `${base}/${net}` : `${base}/`;
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

const MESOS = [
  'gener', 'febrer', 'març', 'abril', 'maig', 'juny',
  'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre',
];

export function dataLlarga(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  const mes = MESOS[m - 1]!;
  // En català la preposició s'apostrofa davant de vocal: d'abril, d'agost, d'octubre.
  const prep = /^[aeiou]/.test(mes) ? "d'" : 'de ';
  return `${d} ${prep}${mes} de ${y}`;
}

export function diesFinsA(iso: string | null, avui: string): number | null {
  if (!iso) return null;
  const fi = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  const ara = Date.parse(`${avui.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(fi) || Number.isNaN(ara)) return null;
  return Math.round((fi - ara) / 86_400_000);
}

export function terminiLlegible(dies: number | null): string {
  if (dies === null) return 'Termini sense data concreta';
  if (dies < 0) return 'Termini tancat';
  if (dies === 0) return 'Últim dia';
  if (dies === 1) return 'Queda 1 dia';
  return `Queden ${dies} dies`;
}

/** Franja de urgencia, para que el color no se decida en cada plantilla por su cuenta. */
export function urgencia(dies: number | null): 'urgent' | 'aviat' | 'tranquil' | 'sense' {
  if (dies === null) return 'sense';
  if (dies <= 7) return 'urgent';
  if (dies <= 21) return 'aviat';
  return 'tranquil';
}

const EUROS = new Intl.NumberFormat('ca-ES', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
});

export function importLlegible(import_total: number | null): string | null {
  if (import_total === null || import_total <= 0) return null;
  return EUROS.format(import_total);
}
