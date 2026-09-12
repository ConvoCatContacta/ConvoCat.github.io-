const UA = 'convocat-bot/0.1 (+https://github.com/ConvoCatContacta/convocatcontacta.github.io)';

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class HttpError extends Error {
  constructor(readonly status: number, readonly url: string) {
    super(`HTTP ${status} — ${url}`);
  }
}

/** GET JSON con reintentos y backoff exponencial en 429 y 5xx. */
export async function fetchJson<T>(url: string, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
      if (res.status === 429 || res.status >= 500) throw new HttpError(res.status, url);
      if (!res.ok) throw new HttpError(res.status, url);
      return (await res.json()) as T;
    } catch (err) {
      last = err;
      if (err instanceof HttpError && err.status < 500 && err.status !== 429) throw err;
      if (i < tries - 1) await sleep(500 * 2 ** i);
    }
  }
  throw last;
}

/**
 * Ejecuta `fn` sobre `items` con N trabajadores y una pausa entre peticiones.
 * BDNS avisa de que puede cortar el acceso ante abuso, así que el ritmo es deliberado.
 */
export async function pool<T, R>(
  items: readonly T[],
  workers: number,
  fn: (item: T, index: number) => Promise<R>,
  opts: { delayMs?: number; onProgress?: (done: number, total: number) => void } = {}
): Promise<R[]> {
  const { delayMs = 0, onProgress } = opts;
  const out = new Array<R>(items.length);
  let next = 0;
  let done = 0;

  await Promise.all(
    Array.from({ length: Math.min(workers, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]!, i);
        done++;
        onProgress?.(done, items.length);
        if (delayMs) await sleep(delayMs);
      }
    })
  );

  return out;
}
