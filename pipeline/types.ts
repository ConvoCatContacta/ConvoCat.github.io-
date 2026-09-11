import { z } from 'zod';

export const FontSchema = z.enum(['bdns', 'raisc']);
export const AmbitSchema = z.enum(['estatal', 'autonomic', 'local']);
export const NivellLocalSchema = z.enum(['municipi', 'comarca', 'provincia', 'altre']);
export const EstatSchema = z.enum(['oberta', 'propera', 'tancada', 'indeterminada']);
export const ConfiancaSchema = z.enum(['alta', 'baixa']);

export const ResumSchema = z.object({
  fitxa: z.array(z.object({ etiqueta: z.string(), valor: z.string() })),
  paragraf: z.string().nullable(),
  model: z.string().nullable(),
  hash_font: z.string(),
  generat: z.string(),
});

export const ConvocatoriaSchema = z.object({
  id: z.string().min(1),
  fonts: z.array(FontSchema).min(1),
  codi_bdns: z.string().nullable(),
  codi_raisc: z.string().nullable(),

  titol: z.string().min(1),
  objecte: z.string().nullable(),

  organ_convocant: z.string().min(1),
  ambit: AmbitSchema,
  nivell_local: NivellLocalSchema.nullable(),
  comarca: z.string().nullable(),
  municipi: z.string().nullable(),

  tipus_beneficiari: z.array(z.string()),
  concurrencia: z.boolean(),
  import_total: z.number().nonnegative().nullable(),

  data_inici: z.string().nullable(),
  data_fi: z.string().nullable(),
  termini_text: z.string().nullable(),
  estat: EstatSchema,
  confianca_termini: ConfiancaSchema,

  url_oficial: z.string().min(1),
  url_bases: z.string().nullable(),
  seu_electronica: z.string().nullable(),

  resum: ResumSchema.nullable(),
  // No hi ha cap marca de temps per registre a propòsit. Si cada fila portés la data de
  // l'última execució, les 3.302 canviarien cada dia i el commit diari seria soroll pur:
  // el diff contra el commit anterior és justament el que detecta les novetats per al butlletí.
  // Quan es van recollir les dades ho diu `meta.json`, que és una sola línia.
});

export type Convocatoria = z.infer<typeof ConvocatoriaSchema>;
export type Resum = z.infer<typeof ResumSchema>;
export type Estat = z.infer<typeof EstatSchema>;

export const MetaSchema = z.object({
  executat: z.string(),
  fonts: z.record(
    z.string(),
    z.object({ recuperats: z.number(), errors: z.number(), descartats: z.number() })
  ),
  total: z.number(),
  obertes: z.number(),
  novetats: z.array(z.string()),
});

export type Meta = z.infer<typeof MetaSchema>;
