import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Convocatoria, Resum } from './types.ts';
import { ResumSchema } from './types.ts';

const MODEL = 'claude-haiku-4-5';

/**
 * Aquest text és la part del projecte amb més risc real. El brief és explícit: si diem a algú
 * que compleix els requisits i no els compleix, el dany és real. Per això el paràgraf ha de ser
 * **descriptiu, mai prescriptiu**, i no pot introduir cap condició que no sigui a l'origen.
 */
const SISTEMA = `Ets un redactor que explica convocatòries d'ajuts públics de Catalunya en llenguatge planer.

A partir NOMÉS de la informació que et donen, escriu un paràgraf que expliqui què finança la
convocatòria i a qui s'adreça. L'has d'escriure TRES vegades: en català, en castellà i en
anglès. Han de dir exactament el mateix, no ser traduccions literals l'una de l'altra: escriu
cadascuna com la escriuria algú que redacta en aquella llengua.

La llargada la marca la informació que tens, no cap objectiu de paraules. Com a màxim 60
paraules. Si només tens el títol i l'organisme, dues frases són suficients i correctes: **és
millor un paràgraf curt i cert que un de llarg amb farciment**.

Regles estrictes, iguals per a les tres llengües:
- Descriu, no aconsellis. Escriu "S'adreça a…" o "Finança…". No escriguis mai "pots demanar-la
  si…", "si compleixes…", "et convé", "has de…" ni cap fórmula que doni a entendre que qui
  llegeix hi té dret. Qui decideix si algú hi té dret són les bases oficials, no nosaltres.
- **No expliquis la finalitat ni el perquè de la convocatòria si no consta al text que et
  donen.** No dedueixis l'objectiu a partir del títol: si el títol diu "juvenil", no afirmis que
  vol fomentar res concret.
- **No descriguis el procediment** (que si és concurrència competitiva, que si els participants
  concorren entre ells, que si cal complir les bases). Això no aporta res i sovint és inventat.
- No ampliïs la llista de beneficiaris. Fes servir només les categories que et donen, tal com
  te les donen.
- No inventis imports, terminis, percentatges, periodicitat ni condicions. Si una dada no hi
  consta, no la mencionis ni diguis que falta.
- No repeteixis el títol literalment; explica'l.
- Llenguatge planer: frases curtes, veu activa, sense llenguatge administratiu. Si has d'usar
  una sigla, explica-la la primera vegada.
- Els noms propis d'organismes es deixen en la llengua original; no els tradueixis.

Respon NOMÉS amb un objecte JSON, sense cap text abans ni després i sense marques de codi, amb
aquesta forma exacta:
{"ca": "...", "es": "...", "en": "..."}`;

/** El hash cobreix exactament el que entra al prompt: si no canvia, el resum segueix valent. */
export function hashFont(c: Convocatoria): string {
  const font = [c.titol, c.objecte ?? '', c.organ_convocant, c.tipus_beneficiari.join(',')].join('\u0000');
  return createHash('sha256').update(font).digest('hex').slice(0, 16);
}

export function textFont(c: Convocatoria): string {
  const parts = [
    `Títol: ${c.titol}`,
    `Qui la convoca: ${c.organ_convocant}`,
  ];
  if (c.tipus_beneficiari.length) parts.push(`Tipus de beneficiari: ${c.tipus_beneficiari.join(', ')}`);
  if (c.objecte) parts.push(`Objecte segons les bases: ${c.objecte}`);
  return parts.join('\n');
}

/** Només es resumeix el que algú pot demanar ara o aviat: la resta seria pagar per res. */
export function calResum(c: Convocatoria): boolean {
  return c.estat === 'oberta' || c.estat === 'propera';
}

const NOM_FITXER = (id: string) => `${id.replace(/[^A-Za-z0-9._-]+/g, '-')}.json`;

function llegeixCache(dir: string, id: string): Resum | null {
  try {
    const brut = JSON.parse(readFileSync(join(dir, NOM_FITXER(id)), 'utf8'));
    const parsed = ResumSchema.safeParse(brut);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function desaCache(dir: string, id: string, resum: Resum): void {
  writeFileSync(join(dir, NOM_FITXER(id)), JSON.stringify(resum, null, 2));
}

/** Neteja el que el model pugui afegir malgrat les instruccions. */
export function netejaParagraf(brut: string): string {
  return brut
    .trim()
    .replace(/^["'«»]+|["'«»]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function demanaParagrafs(
  client: Anthropic,
  c: Convocatoria
): Promise<Resum['paragrafs']> {
  const resposta = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: SISTEMA,
    messages: [{ role: 'user', content: textFont(c) }],
  });

  const text = resposta.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  // Malgrat les instruccions, un model pot envoltar el JSON amb un bloc de codi.
  const net = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const brut = JSON.parse(net) as Record<string, unknown>;

  const paragrafs = {
    ca: netejaParagraf(String(brut.ca ?? '')),
    es: netejaParagraf(String(brut.es ?? '')),
    en: netejaParagraf(String(brut.en ?? '')),
  };

  // Tot o res: una fitxa en anglès amb el paràgraf en català es llegeix pitjor que sense.
  if (!paragrafs.ca || !paragrafs.es || !paragrafs.en) throw new Error('falta algun idioma');
  return paragrafs;
}

/** Executa `tasques` amb un límit de peticions simultànies. */
async function enTanda<T>(tasques: (() => Promise<T>)[], simultanies: number): Promise<void> {
  let seguent = 0;
  const treballadors = Array.from({ length: Math.min(simultanies, tasques.length) }, async () => {
    while (seguent < tasques.length) {
      const meva = seguent++;
      await tasques[meva]!();
    }
  });
  await Promise.all(treballadors);
}

export type InformeResums = {
  candidates: number;
  de_cache: number;
  generats: number;
  errors: number;
  omes: boolean;
};

/**
 * Afegeix el paràgraf a les convocatòries obertes o properes, mutant-les.
 *
 * Si no hi ha clau d'API, o si una crida falla, la fitxa determinista es publica igual sense
 * paràgraf: el resum és un extra, no pot tombar la publicació.
 */
export async function afegeixResums(
  convocatories: Convocatoria[],
  opcions: { dir: string; log?: (m: string) => void }
): Promise<InformeResums> {
  const log = opcions.log ?? (() => {});
  const candidates = convocatories.filter(calResum);
  const informe: InformeResums = {
    candidates: candidates.length, de_cache: 0, generats: 0, errors: 0, omes: false,
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    log('  sense ANTHROPIC_API_KEY: es publica la fitxa sense paràgraf');
    informe.omes = true;
    return informe;
  }

  mkdirSync(opcions.dir, { recursive: true });
  const client = new Anthropic();

  const pendents: Convocatoria[] = [];
  for (const c of candidates) {
    const hash = hashFont(c);
    const desat = llegeixCache(opcions.dir, c.id);
    if (desat && desat.hash_font === hash) {
      c.resum = desat;
      informe.de_cache++;
    } else {
      pendents.push(c);
    }
  }

  log(`  ${informe.de_cache} de cache · ${pendents.length} per generar`);

  await enTanda(
    pendents.map((c) => async () => {
      try {
        const resum: Resum = {
          paragrafs: await demanaParagrafs(client, c),
          model: MODEL,
          hash_font: hashFont(c),
          generat: new Date().toISOString().slice(0, 10),
        };
        c.resum = resum;
        desaCache(opcions.dir, c.id, resum);
        informe.generats++;
        if (informe.generats % 25 === 0) log(`  ${informe.generats}/${pendents.length}`);
      } catch (err) {
        informe.errors++;
        const motiu = err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : String(err);
        log(`  ! resum fallit ${c.id}: ${motiu}`);
      }
    }),
    4
  );

  return informe;
}
