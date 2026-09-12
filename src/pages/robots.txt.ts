import type { APIRoute } from 'astro';

// Es genera en comptes de posar-lo a public/ perquè l'URL del sitemap depèn de `site` i
// `base`: el dia que hi hagi domini propi, aquest fitxer s'actualitza sol.
export const GET: APIRoute = ({ site }) => {
  const arrel = new URL(import.meta.env.BASE_URL, site ?? 'https://example.invalid');
  const sitemap = new URL('sitemap-index.xml', `${arrel.href.replace(/\/?$/, '/')}`);

  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemap.href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
};
