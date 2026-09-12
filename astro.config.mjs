import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// El repositori es diu "convocatcontacta.github.io", que és el nom que GitHub tracta com a
// user page: el lloc es publica a l'arrel del domini i no sota cap subruta.
// Si algun dia hi ha domini propi, només cal exportar SITE i afegir el CNAME; per això cap
// plantilla escriu rutes internes a mà, totes passen per import.meta.env.BASE_URL.
const site = process.env.SITE ?? 'https://convocatcontacta.github.io';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap()],
});