import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { carregaGeoIndex } from './comarca.ts';
import { dedupe } from './dedupe.ts';
import { desDeBdns, desDeRaisc } from './normalize.ts';
import * as bdns from './sources/bdns.ts';
import * as raisc from './sources/raisc.ts';
import { ConvocatoriaSchema, type Convocatoria, type Meta } from './types.ts';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..');
const DADES = join(ARREL, 'data');

const avui = (process.env.AVUI ?? new Date().toISOString()).slice(0, 10);
const mesos = Number(process.env.MESOS ?? 12);

function desdeFaMesos(n: number): string {
  const d = new Date(`${avui}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - n);
  return d.toISOString().slice(0, 10);
}

const log = (...a: unknown[]) => console.error(...a);

async function main() {
  const finestra = { desde: desdeFaMesos(mesos), fins: avui };
  log(`convocat · ingesta ${finestra.desde} → ${finestra.fins}`);

  log('· índex geogràfic (ens locals)');
  const geo = await carregaGeoIndex();
  log(`  ${geo.ens.size} ens locals · ${geo.comarques.size} comarques`);

  log('· BDNS: òrgans de Catalunya');
  const grups = await bdns.organsCatalunya();
  for (const g of grups) log(`  idAdmon=${g.idAdmon}: ${g.ids.length} òrgans`);

  log('· BDNS: llistat');
  const llista = await bdns.llistaConvocatories(grups, finestra);
  log(`  ${llista.length} convocatòries`);

  log('· BDNS: detall');
  const detalls = await bdns.detalls(
    llista.map((c) => String(c.numeroConvocatoria)),
    (fet, total) => { if (fet % 500 === 0) log(`  ${fet}/${total}`); }
  );
  const errorsBdns = detalls.filter((d) => d === null).length;

  log('· RAISC');
  const files = await raisc.convocatoriesObertes(desdeFaMesos(mesos));
  log(`  ${files.length} files`);

  // --- normalización
  let descartats = 0;
  const norm = <T>(items: readonly T[], fn: (x: T) => Convocatoria | null): Convocatoria[] => {
    const out: Convocatoria[] = [];
    for (const it of items) {
      const c = fn(it);
      if (!c) { descartats++; continue; }
      const ok = ConvocatoriaSchema.safeParse(c);
      if (ok.success) out.push(ok.data);
      else descartats++;
    }
    return out;
  };

  const deBdns = norm(detalls.filter((d) => d !== null), (d) => desDeBdns(d!, geo, avui));
  const deRaisc = norm(files, (r) => desDeRaisc(r, geo, avui));

  // Orden totalmente determinista: el `id` desempata. Sin él, el orden de llegada de las
  // respuestas de la API decidiría el del fichero y el commit diario saldría lleno de
  // movimientos falsos, que es justo lo que impediría leer el diff.
  const totes = dedupe(deBdns, deRaisc)
    .filter((c) => c.concurrencia)
    .sort(
      (a, b) =>
        (a.data_fi ?? '9999').localeCompare(b.data_fi ?? '9999') || a.id.localeCompare(b.id)
    );

  const obertes = totes.filter((c) => c.estat === 'oberta');

  const meta: Meta = {
    executat: new Date().toISOString(),
    fonts: {
      bdns: { recuperats: deBdns.length, errors: errorsBdns, descartats: 0 },
      raisc: { recuperats: deRaisc.length, errors: 0, descartats: 0 },
    },
    total: totes.length,
    obertes: obertes.length,
    novetats: [],
  };

  mkdirSync(DADES, { recursive: true });
  writeFileSync(join(DADES, 'convocatories.json'), JSON.stringify(totes, null, 2));
  writeFileSync(join(DADES, 'meta.json'), JSON.stringify(meta, null, 2));

  // --- informe
  const n = (f: (c: Convocatoria) => boolean) => obertes.filter(f).length;
  const grup = (f: (c: Convocatoria) => string | null) =>
    obertes.reduce<Record<string, number>>((a, c) => {
      const k = f(c) ?? '—'; a[k] = (a[k] ?? 0) + 1; return a;
    }, {});
  const locals = n((c) => c.ambit === 'local');

  console.log(JSON.stringify({
    finestra,
    bdns: { llistades: llista.length, detalls_ok: detalls.length - errorsBdns, errors: errorsBdns },
    raisc: { files: files.length },
    descartats,
    totals: { amb_concurrencia: totes.length, obertes: obertes.length },
    obertes: {
      per_ambit: grup((c) => c.ambit),
      per_font: grup((c) => c.fonts.join('+')),
      confianca_alta: n((c) => c.confianca_termini === 'alta'),
      locals,
      locals_amb_comarca: n((c) => c.ambit === 'local' && c.comarca !== null),
      // Un ente local que no se identifica contra el registro catalán suele significar que
      // no es catalán: así se detectó que la lista de órganos arrastraba Ibiza y Santander.
      locals_no_identificats: n((c) => c.ambit === 'local' && c.nivell_local === null),
      amb_import: n((c) => c.import_total !== null),
      amb_seu: n((c) => c.seu_electronica !== null),
      comarques: Object.keys(grup((c) => c.comarca)).filter((k) => k !== '—').length,
    },
  }, null, 2));

  log(`\n✓ data/convocatories.json · ${totes.length} convocatòries · ${obertes.length} obertes`);
}

main().catch((e) => { console.error(e); process.exit(1); });
