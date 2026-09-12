import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// El repositorio se llama "ConvoCat.github.io-" (con guion final), así que GitHub Pages
// lo publica como project page bajo esa subruta y no en la raíz del dominio.
// Cuando haya dominio propio basta con exportar SITE y BASE_PATH="/": por eso ninguna
// plantilla debe escribir rutas internas a mano, todas pasan por import.meta.env.BASE_URL.
const site = process.env.SITE ?? 'https://convocatcontacta.github.io';
const base = process.env.BASE_PATH ?? '/ConvoCat.github.io-';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [sitemap()],
});