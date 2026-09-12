import type { Idioma } from './textos.ts';

export type Legal = {
  titolPagina: string;
  descripcio: string;
  h1: string;
  queEs: { titol: string; text: string };
  fonts: { titol: string; intro: string; bdns: string; raisc: string; reutilitzacio: string };
  limits: { titol: string; items: string[]; tancament: string };
  contacte: { titol: string; text: string };
  privadesa: { titol: string; sensSeguiment: string; correu: string };
  actualitzat: (d: string) => string;
};

const ca: Legal = {
  titolPagina: 'Avís legal i fonts',
  descripcio: "Qui hi ha darrere de Convocat, d'on surten les dades i quines limitacions tenen.",
  h1: 'Avís legal i fonts',
  queEs: {
    titol: 'Què és això',
    text: "Convocat és un projecte independent que recull convocatòries d'ajuts i subvencions obertes a Catalunya i les resumeix. No és un web oficial, no depèn de cap administració pública i no hi té cap vincle.",
  },
  fonts: {
    titol: "D'on surten les dades",
    intro: 'De dues fonts públiques i obertes, que es consulten cada dia:',
    bdns: 'La Base de Dades Nacional de Subvencions (BDNS), el sistema estatal de publicitat de subvencions.',
    raisc: "El Registre d'ajuts i subvencions de Catalunya (RAISC), publicat com a dades obertes pel portal de transparència de la Generalitat.",
    reutilitzacio:
      "La reutilització de les dades de la BDNS està subjecta a les condicions del seu avís legal. La informació és de naturalesa dinàmica: pot ser corregida, modificada o eliminada a l'origen després que nosaltres l'haguem recollit.",
  },
  limits: {
    titol: 'Limitacions que has de conèixer',
    items: [
      'Els resums són orientatius. Descriuen el que diuen les dades publicades; no determinen si compleixes els requisits ni substitueixen les bases reguladores.',
      "No hi són totes. Recollim el que les administracions publiquen a les fonts esmentades. Una convocatòria mal registrada a l'origen no apareixerà aquí.",
      "Alguns terminis no es poden verificar. Quan l'origen no publica una data estructurada sinó un text lliure, ho indiquem a la fitxa i no el convertim en data.",
      'El paràgraf de resum el genera un model de llenguatge a partir de les dades publicades, i pot contenir errors. El text oficial sempre és accessible a la mateixa fitxa.',
    ],
    tancament:
      'Abans de presentar cap sol·licitud, consulta sempre la convocatòria oficial enllaçada a cada fitxa.',
  },
  contacte: {
    titol: 'Contacte',
    text: 'Escriu-nos per reportar un error en una fitxa, per demanar que afegim una font o per qualsevol dubte sobre el projecte.',
  },
  privadesa: {
    titol: 'Privadesa',
    sensSeguiment: 'Aquest lloc no fa servir galetes de seguiment ni perfila els visitants.',
    correu:
      "Si demanes les alertes, la teva adreça s'utilitza només per avisar-te de noves convocatòries: no la compartim amb ningú ni l'utilitzem per a res més. La llista la gestiona Buttondown, que actua com a encarregat del tractament, i tots els correus porten un enllaç per donar-te de baixa en qualsevol moment.",
  },
  actualitzat: (d) => `L'última actualització de les dades va ser el ${d}.`,
};

const es: Legal = {
  titolPagina: 'Aviso legal y fuentes',
  descripcio: 'Quién está detrás de Convocat, de dónde salen los datos y qué limitaciones tienen.',
  h1: 'Aviso legal y fuentes',
  queEs: {
    titol: 'Qué es esto',
    text: 'Convocat es un proyecto independiente que recoge convocatorias de ayudas y subvenciones abiertas en Cataluña y las resume. No es una web oficial, no depende de ninguna administración pública y no tiene vínculo alguno con ellas.',
  },
  fonts: {
    titol: 'De dónde salen los datos',
    intro: 'De dos fuentes públicas y abiertas, que se consultan cada día:',
    bdns: 'La Base de Datos Nacional de Subvenciones (BDNS), el sistema estatal de publicidad de subvenciones.',
    raisc: 'El Registro de ayudas y subvenciones de Cataluña (RAISC), publicado como datos abiertos por el portal de transparencia de la Generalitat.',
    reutilitzacio:
      'La reutilización de los datos de la BDNS está sujeta a las condiciones de su aviso legal. La información es de naturaleza dinámica: puede ser corregida, modificada o eliminada en el origen después de que nosotros la hayamos recogido.',
  },
  limits: {
    titol: 'Limitaciones que debes conocer',
    items: [
      'Los resúmenes son orientativos. Describen lo que dicen los datos publicados; no determinan si cumples los requisitos ni sustituyen a las bases reguladoras.',
      'No están todas. Recogemos lo que las administraciones publican en las fuentes mencionadas. Una convocatoria mal registrada en el origen no aparecerá aquí.',
      'Algunos plazos no se pueden verificar. Cuando el origen no publica una fecha estructurada sino un texto libre, lo indicamos en la ficha y no lo convertimos en fecha.',
      'El párrafo de resumen lo genera un modelo de lenguaje a partir de los datos publicados, y puede contener errores. El texto oficial siempre está accesible en la misma ficha.',
    ],
    tancament:
      'Antes de presentar ninguna solicitud, consulta siempre la convocatoria oficial enlazada en cada ficha.',
  },
  contacte: {
    titol: 'Contacto',
    text: 'Escríbenos para reportar un error en una ficha, para pedir que añadamos una fuente o por cualquier duda sobre el proyecto.',
  },
  privadesa: {
    titol: 'Privacidad',
    sensSeguiment: 'Este sitio no usa cookies de seguimiento ni perfila a los visitantes.',
    correu:
      'Si pides las alertas, tu dirección se usa solo para avisarte de nuevas convocatorias: no la compartimos con nadie ni la usamos para nada más. La lista la gestiona Buttondown, que actúa como encargado del tratamiento, y todos los correos llevan un enlace para darte de baja en cualquier momento.',
  },
  actualitzat: (d) => `La última actualización de los datos fue el ${d}.`,
};

const en: Legal = {
  titolPagina: 'Legal notice and sources',
  descripcio: 'Who is behind Convocat, where the data comes from and what its limitations are.',
  h1: 'Legal notice and sources',
  queEs: {
    titol: 'What this is',
    text: 'Convocat is an independent project that collects open grant and subsidy calls in Catalonia and summarises them. It is not an official website, it does not belong to any public administration and has no connection with one.',
  },
  fonts: {
    titol: 'Where the data comes from',
    intro: 'From two public, open sources, queried every day:',
    bdns: 'The Spanish National Subsidy Database (BDNS), the state system for publishing subsidies.',
    raisc: 'The Catalan Register of Grants and Subsidies (RAISC), published as open data by the Catalan transparency portal.',
    reutilitzacio:
      'Reuse of BDNS data is subject to the conditions of its own legal notice. The information is dynamic: it may be corrected, modified or removed at source after we have collected it.',
  },
  limits: {
    titol: 'Limitations you should know about',
    items: [
      'The summaries are orientative. They describe what the published data says; they do not determine whether you meet the requirements and do not replace the official terms.',
      'Not every call is here. We collect what administrations publish in the sources above. A call badly registered at source will not appear here.',
      'Some deadlines cannot be verified. Where the source publishes free text instead of a structured date, we say so on the entry and do not turn it into a date.',
      'The summary paragraph is generated by a language model from the published data and may contain errors. The official text is always available on the same page.',
    ],
    tancament:
      'Before submitting any application, always check the official call linked on each entry.',
  },
  contacte: {
    titol: 'Contact',
    text: 'Write to us to report an error on an entry, to ask us to add a source, or with any question about the project.',
  },
  privadesa: {
    titol: 'Privacy',
    sensSeguiment: 'This site does not use tracking cookies and does not profile visitors.',
    correu:
      'If you ask for alerts, your address is used only to tell you about new calls: we do not share it with anyone or use it for anything else. The list is run through Buttondown, acting as data processor, and every email carries an unsubscribe link you can use at any time.',
  },
  actualitzat: (d) => `The data was last updated on ${d}.`,
};

const TAULA: Record<Idioma, Legal> = { ca, es, en };

export function legal(idioma: Idioma): Legal {
  return TAULA[idioma];
}
