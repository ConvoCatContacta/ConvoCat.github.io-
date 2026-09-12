import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Convocatoria } from './types.ts';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..');
const LLOC = process.env.LLOC ?? 'https://convocatcontacta.github.io';

/**
 * Prepara el butlletí de novetats i el deixa **com a esborrany** a Buttondown.
 *
 * No s'envia sol i això és deliberat: enviar a una llista de correu resums generats
 * automàticament, sense que ningú els hagi llegit, és exactament el risc que el brief marca com
 * a inacceptable. L'esborrany es revisa i s'envia a mà.
 */

export type Novetat = { id: string; titol: string; organ: string; data_fi: string | null };

/** Novetats = convocatòries obertes ara que abans no ho estaven (o que no hi eren). */
export function novetats(abans: Convocatoria[], ara: Convocatoria[]): Novetat[] {
  const obertesAbans = new Set(
    abans.filter((c) => c.estat === 'oberta').map((c) => c.id)
  );
  return ara
    .filter((c) => c.estat === 'oberta' && !obertesAbans.has(c.id))
    .map((c) => ({ id: c.id, titol: c.titol, organ: c.organ_convocant, data_fi: c.data_fi }));
}

function llescaId(id: string): string {
  return id.replace(/[^A-Za-z0-9._-]+/g, '-');
}

function escapa(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

export function cosHtml(items: Novetat[]): string {
  const files = items
    .map((n) => {
      const url = `${LLOC}/convocatoria/${llescaId(n.id)}`;
      const termini = n.data_fi ? ` · fins al ${escapa(n.data_fi)}` : '';
      return `<li><a href="${url}">${escapa(n.titol)}</a><br><small>${escapa(n.organ)}${termini}</small></li>`;
    })
    .join('\n');

  return [
    `<p>Aquestes convocatòries s'han obert des de l'últim butlletí.</p>`,
    `<ul>\n${files}\n</ul>`,
    `<p><a href="${LLOC}/">Veure totes les convocatòries obertes</a></p>`,
    `<p><small>Convocat és un projecte independent i no és un web oficial. Els resums són`,
    `orientatius: el que val són les bases oficials de cada convocatòria.</small></p>`,
  ].join('\n');
}

/** Estat anterior tal com és al darrer commit. Si no hi és (primera execució), llista buida. */
function estatAnterior(): Convocatoria[] {
  try {
    const brut = execFileSync('git', ['show', 'HEAD:data/convocatories.json'], {
      cwd: ARREL, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    });
    return JSON.parse(brut) as Convocatoria[];
  } catch {
    return [];
  }
}

async function main() {
  const ara = JSON.parse(
    readFileSync(join(ARREL, 'data', 'convocatories.json'), 'utf8')
  ) as Convocatoria[];

  const abans = estatAnterior();
  if (!abans.length) {
    console.log('Primera execució amb dades: no hi ha res amb què comparar, cap butlletí.');
    return;
  }

  const items = novetats(abans, ara);
  console.log(`${items.length} convocatòries noves obertes`);
  if (!items.length) return;

  const clau = process.env.BUTTONDOWN_API_KEY;
  if (!clau) {
    console.log("Sense BUTTONDOWN_API_KEY: no es crea l'esborrany. Novetats:");
    for (const n of items.slice(0, 20)) console.log(`  · ${n.titol} (${n.organ})`);
    return;
  }

  const avui = new Date().toISOString().slice(0, 10);
  const resposta = await fetch('https://api.buttondown.com/v1/emails', {
    method: 'POST',
    headers: { Authorization: `Token ${clau}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: `${items.length} ${items.length === 1 ? 'nova convocatòria' : 'noves convocatòries'} · ${avui}`,
      body: cosHtml(items),
      status: 'draft',
    }),
  });

  if (!resposta.ok) {
    // Un butlletí fallit no pot tombar la ingesta: les dades i el lloc valen igualment.
    console.error(`::warning::Buttondown ha respost ${resposta.status}: ${await resposta.text()}`);
    return;
  }

  console.log("Esborrany creat a Buttondown. Cal revisar-lo i enviar-lo a mà.");
}

main().catch((e) => {
  console.error(`::warning::El butlletí ha fallat: ${e}`);
});
