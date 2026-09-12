/**
 * El català és l'idioma per defecte i viu a l'arrel; el castellà i l'anglès pengen d'un prefix.
 * El contingut oficial de cada convocatòria (títol, objecte, nom de l'organisme) NO es tradueix
 * mai: és el text que identifica el document a la font, i una traducció faria que no lligués
 * amb la convocatòria oficial ni amb el cercador de la BDNS. El que sí que es tradueix és la
 * interfície i el paràgraf en llenguatge planer, que el generem nosaltres.
 */
export const IDIOMES = ['ca', 'es', 'en'] as const;
export type Idioma = (typeof IDIOMES)[number];
export const IDIOMA_PER_DEFECTE: Idioma = 'ca';

export const NOM_IDIOMA: Record<Idioma, string> = {
  ca: 'Català',
  es: 'Castellano',
  en: 'English',
};

/** Codi per a l'atribut lang i per a hreflang. */
export const CODI_HREFLANG: Record<Idioma, string> = { ca: 'ca', es: 'es', en: 'en' };

type Textos = {
  nav: { convocatories: string; comarques: string; guia: string; avis: string; principal: string };
  inici: {
    titolPagina: string; descripcio: string; h1: string; entrada: string;
    recompte: (n: number) => string;
  };
  filtres: {
    cerca: string; cercaPlaceholder: string; comarca: string; totes: string;
    ambit: string; tots: string; ambitAutonomic: string; ambitLocal: string;
    termini: string; qualsevol: string; menysDe7: string; menysDe30: string;
    beneficiari: string; neteja: string; resultat: (n: number) => string; capResultat: string;
  };
  targeta: { dotacio: string };
  termini: {
    sense: string; tancat: string; ultimDia: string; unDia: string; dies: (n: number) => string;
  };
  ambits: { local: string; autonomic: string; estatal: string };
  estats: { oberta: string; propera: string; tancada: string; indeterminada: string };
  fitxa: {
    tornar: string; quiConvoca: string; aQui: string; dotacio: string; termini: string;
    municipi: string; noConsta: string; delAl: (a: string, b: string) => string;
    finsAl: (d: string) => string; enPoquesParaules: string; marcaResum: string;
    objecteOficial: string; veureOficial: string; bases: string; seu: string;
  };
  comarques: {
    titolPagina: string; descripcio: string; h1: string; entrada: string;
    obertes: (n: number) => string; aLaComarca: (c: string) => string;
    entradaComarca: (c: string) => string; llistatGeneral: string;
  };
  alta: { titol: string; cosAmbProveidor: string; placeholder: string; botoProveidor: string };
  disclaimer: string;
  fontData: { font: (f: string) => string; recollides: (d: string) => string; terminiBaix: string };
  peu: { descripcio: string; avis: string };
  noTrobat: { titol: string; descripcio: string; h1: string; cos: string; anarInici: string; anarComarques: string };
  idioma: { etiqueta: string };
};

const ca: Textos = {
  nav: { convocatories: 'Convocatòries', comarques: 'Comarques', guia: 'Com es demana', avis: 'Avís legal', principal: 'Principal' },
  inici: {
    titolPagina: 'Convocat',
    descripcio: "Radar de convocatòries d'ajuts i subvencions obertes a Catalunya, en català i explicades en llenguatge planer.",
    h1: 'Ajuts i subvencions obertes a Catalunya',
    entrada: "Convocatòries que encara admeten sol·licituds, de la Generalitat, diputacions, consells comarcals i ajuntaments. En català i sense lletra petita: qui convoca, a qui s'adreça, quants diners i fins quan.",
    recompte: (n) => `${n} convocatòries obertes ara mateix`,
  },
  filtres: {
    cerca: 'Cerca', cercaPlaceholder: 'Paraula clau o organisme', comarca: 'Comarca', totes: 'Totes',
    ambit: 'Àmbit', tots: 'Tots', ambitAutonomic: 'Catalunya', ambitLocal: 'Local',
    termini: 'Termini', qualsevol: 'Qualsevol', menysDe7: 'Menys de 7 dies', menysDe30: 'Menys de 30 dies',
    beneficiari: 'Tipus de beneficiari', neteja: 'Neteja els filtres',
    resultat: (n) => `${n} ${n === 1 ? 'convocatòria' : 'convocatòries'}`,
    capResultat: 'Cap convocatòria coincideix amb aquests filtres.',
  },
  targeta: { dotacio: 'Dotació' },
  termini: {
    sense: 'Termini sense data concreta', tancat: 'Termini tancat', ultimDia: 'Últim dia',
    unDia: 'Queda 1 dia', dies: (n) => `Queden ${n} dies`,
  },
  ambits: { local: 'Local', autonomic: 'Catalunya', estatal: 'Estatal' },
  estats: { oberta: 'Oberta', propera: 'Encara no oberta', tancada: 'Tancada', indeterminada: 'Termini sense confirmar' },
  fitxa: {
    tornar: '← Totes les convocatòries', quiConvoca: 'Qui la convoca', aQui: "A qui s'adreça",
    dotacio: 'Dotació total', termini: 'Termini', municipi: 'Municipi', noConsta: "No consta a l'origen",
    delAl: (a, b) => `Del ${a} al ${b}`, finsAl: (d) => `Fins al ${d}`,
    enPoquesParaules: 'En poques paraules',
    marcaResum: 'Resum generat automàticament a partir de les dades publicades. El que val són les bases oficials.',
    objecteOficial: 'Objecte segons les bases (text oficial)',
    veureOficial: 'Veure la convocatòria oficial', bases: 'Bases reguladores', seu: 'Seu electrònica',
  },
  comarques: {
    titolPagina: 'Comarques', descripcio: "Convocatòries d'ajuts obertes per comarca a Catalunya.",
    h1: 'Per comarca',
    entrada: "Convocatòries d'ajuntaments, consells comarcals i altres ens locals, agrupades per comarca. Només apareixen les comarques amb alguna convocatòria oberta ara mateix.",
    obertes: (n) => `${n} convocatòries obertes`,
    aLaComarca: (c) => `Ajuts i subvencions ${c}`,
    entradaComarca: (c) => `Convocatòries d'ens locals ${c} que encara admeten sol·licituds. Les convocatòries de la Generalitat s'apliquen a tot Catalunya i les trobaràs al`,
    llistatGeneral: 'llistat general',
  },
  alta: {
    titol: 'Rep les noves convocatòries per correu',
    cosAmbProveidor: "Un correu amb les convocatòries que s'obren a Catalunya, en català i explicades en llenguatge planer. Pots donar-te de baixa quan vulguis.", botoProveidor: 'Vull les alertes',
    placeholder: 'el.teu@correu.cat',
  },
  disclaimer: "Això és un resum orientatiu, no assessorament. Descriu a qui s'adreça la convocatòria segons les dades publicades, no determina si hi tens dret. Les condicions que valen són les de les bases reguladores oficials. Comprova sempre els terminis i els requisits al document oficial abans de presentar cap sol·licitud.",
  fontData: {
    font: (f) => `Font: ${f}.`, recollides: (d) => `Dades recollides el ${d}.`,
    terminiBaix: "El termini d'aquesta convocatòria no consta com a data estructurada a l'origen, només com a text, i per tant no l'hem pogut verificar.",
  },
  peu: {
    descripcio: 'és un projecte independent. No és un web oficial ni té cap vincle amb cap administració pública. Les dades provenen de fonts obertes i cada fitxa enllaça sempre a la convocatòria oficial.',
    avis: 'Avís legal i fonts',
  },
  noTrobat: {
    titol: 'Pàgina no trobada', descripcio: 'Aquesta pàgina no existeix a Convocat.',
    h1: 'Aquesta pàgina no hi és',
    cos: "Potser l'enllaç està mal copiat. Les convocatòries que hem publicat alguna vegada conserven la seva fitxa encara que el termini ja s'hagi tancat, així que un enllaç d'un correu antic hauria de continuar funcionant.",
    anarInici: 'Veure les convocatòries obertes', anarComarques: 'Buscar per comarca',
  },
  idioma: { etiqueta: 'Idioma' },
};

const es: Textos = {
  nav: { convocatories: 'Convocatorias', comarques: 'Comarcas', guia: 'Cómo se pide', avis: 'Aviso legal', principal: 'Principal' },
  inici: {
    titolPagina: 'Convocat',
    descripcio: 'Radar de convocatorias de ayudas y subvenciones abiertas en Cataluña, explicadas en lenguaje claro.',
    h1: 'Ayudas y subvenciones abiertas en Cataluña',
    entrada: 'Convocatorias que todavía admiten solicitudes, de la Generalitat, diputaciones, consejos comarcales y ayuntamientos. Sin letra pequeña: quién convoca, a quién se dirige, cuánto dinero y hasta cuándo.',
    recompte: (n) => `${n} convocatorias abiertas ahora mismo`,
  },
  filtres: {
    cerca: 'Buscar', cercaPlaceholder: 'Palabra clave u organismo', comarca: 'Comarca', totes: 'Todas',
    ambit: 'Ámbito', tots: 'Todos', ambitAutonomic: 'Cataluña', ambitLocal: 'Local',
    termini: 'Plazo', qualsevol: 'Cualquiera', menysDe7: 'Menos de 7 días', menysDe30: 'Menos de 30 días',
    beneficiari: 'Tipo de beneficiario', neteja: 'Limpiar los filtros',
    resultat: (n) => `${n} ${n === 1 ? 'convocatoria' : 'convocatorias'}`,
    capResultat: 'Ninguna convocatoria coincide con estos filtros.',
  },
  targeta: { dotacio: 'Dotación' },
  termini: {
    sense: 'Plazo sin fecha concreta', tancat: 'Plazo cerrado', ultimDia: 'Último día',
    unDia: 'Queda 1 día', dies: (n) => `Quedan ${n} días`,
  },
  ambits: { local: 'Local', autonomic: 'Cataluña', estatal: 'Estatal' },
  estats: { oberta: 'Abierta', propera: 'Aún no abierta', tancada: 'Cerrada', indeterminada: 'Plazo sin confirmar' },
  fitxa: {
    tornar: '← Todas las convocatorias', quiConvoca: 'Quién la convoca', aQui: 'A quién se dirige',
    dotacio: 'Dotación total', termini: 'Plazo', municipi: 'Municipio', noConsta: 'No consta en el origen',
    delAl: (a, b) => `Del ${a} al ${b}`, finsAl: (d) => `Hasta el ${d}`,
    enPoquesParaules: 'En pocas palabras',
    marcaResum: 'Resumen generado automáticamente a partir de los datos publicados. Lo que vale son las bases oficiales.',
    objecteOficial: 'Objeto según las bases (texto oficial)',
    veureOficial: 'Ver la convocatoria oficial', bases: 'Bases reguladoras', seu: 'Sede electrónica',
  },
  comarques: {
    titolPagina: 'Comarcas', descripcio: 'Convocatorias de ayudas abiertas por comarca en Cataluña.',
    h1: 'Por comarca',
    entrada: 'Convocatorias de ayuntamientos, consejos comarcales y otros entes locales, agrupadas por comarca. Solo aparecen las comarcas con alguna convocatoria abierta ahora mismo.',
    obertes: (n) => `${n} convocatorias abiertas`,
    aLaComarca: (c) => `Ayudas y subvenciones ${c}`,
    entradaComarca: (c) => `Convocatorias de entes locales ${c} que todavía admiten solicitudes. Las convocatorias de la Generalitat se aplican a toda Cataluña y las encontrarás en el`,
    llistatGeneral: 'listado general',
  },
  alta: {
    titol: 'Recibe las nuevas convocatorias por correo',
    cosAmbProveidor: 'Un correo con las convocatorias que se abren en Cataluña, explicadas en lenguaje claro. Puedes darte de baja cuando quieras.', botoProveidor: 'Quiero las alertas',
    placeholder: 'tu@correo.es',
  },
  disclaimer: 'Esto es un resumen orientativo, no asesoramiento. Describe a quién se dirige la convocatoria según los datos publicados, no determina si tienes derecho a ella. Las condiciones que valen son las de las bases reguladoras oficiales. Comprueba siempre los plazos y los requisitos en el documento oficial antes de presentar ninguna solicitud.',
  fontData: {
    font: (f) => `Fuente: ${f}.`, recollides: (d) => `Datos recogidos el ${d}.`,
    terminiBaix: 'El plazo de esta convocatoria no consta como fecha estructurada en el origen, solo como texto, y por tanto no hemos podido verificarlo.',
  },
  peu: {
    descripcio: 'es un proyecto independiente. No es una web oficial ni tiene vínculo alguno con ninguna administración pública. Los datos provienen de fuentes abiertas y cada ficha enlaza siempre a la convocatoria oficial.',
    avis: 'Aviso legal y fuentes',
  },
  noTrobat: {
    titol: 'Página no encontrada', descripcio: 'Esta página no existe en Convocat.',
    h1: 'Esta página no está',
    cos: 'Quizá el enlace está mal copiado. Las convocatorias que hemos publicado alguna vez conservan su ficha aunque el plazo ya se haya cerrado, así que un enlace de un correo antiguo debería seguir funcionando.',
    anarInici: 'Ver las convocatorias abiertas', anarComarques: 'Buscar por comarca',
  },
  idioma: { etiqueta: 'Idioma' },
};

const en: Textos = {
  nav: { convocatories: 'Calls', comarques: 'Counties', guia: 'How to apply', avis: 'Legal notice', principal: 'Main' },
  inici: {
    titolPagina: 'Convocat',
    descripcio: 'A radar of open grant and subsidy calls in Catalonia, explained in plain language.',
    h1: 'Open grants and subsidies in Catalonia',
    entrada: "Calls still accepting applications, from the Catalan government, provincial councils, county councils and town councils. No small print: who is offering it, who it is for, how much and until when.",
    recompte: (n) => `${n} calls open right now`,
  },
  filtres: {
    cerca: 'Search', cercaPlaceholder: 'Keyword or public body', comarca: 'County', totes: 'All',
    ambit: 'Level', tots: 'All', ambitAutonomic: 'Catalonia', ambitLocal: 'Local',
    termini: 'Deadline', qualsevol: 'Any', menysDe7: 'Less than 7 days', menysDe30: 'Less than 30 days',
    beneficiari: 'Type of applicant', neteja: 'Clear filters',
    resultat: (n) => `${n} ${n === 1 ? 'call' : 'calls'}`,
    capResultat: 'No call matches these filters.',
  },
  targeta: { dotacio: 'Budget' },
  termini: {
    sense: 'No specific deadline', tancat: 'Deadline passed', ultimDia: 'Last day',
    unDia: '1 day left', dies: (n) => `${n} days left`,
  },
  ambits: { local: 'Local', autonomic: 'Catalonia', estatal: 'National' },
  estats: { oberta: 'Open', propera: 'Not open yet', tancada: 'Closed', indeterminada: 'Deadline unconfirmed' },
  fitxa: {
    tornar: '← All calls', quiConvoca: 'Offered by', aQui: 'Who it is for',
    dotacio: 'Total budget', termini: 'Deadline', municipi: 'Municipality', noConsta: 'Not stated at source',
    delAl: (a, b) => `From ${a} to ${b}`, finsAl: (d) => `Until ${d}`,
    enPoquesParaules: 'In brief',
    marcaResum: 'Summary generated automatically from the published data. The official terms are what count.',
    objecteOficial: 'Purpose as stated in the official terms',
    veureOficial: 'View the official call', bases: 'Official terms', seu: 'Online application portal',
  },
  comarques: {
    titolPagina: 'Counties', descripcio: 'Open grant calls by county in Catalonia.',
    h1: 'By county',
    entrada: 'Calls from town councils, county councils and other local bodies, grouped by county. Only counties with at least one open call are listed.',
    obertes: (n) => `${n} open calls`,
    aLaComarca: (c) => `Grants and subsidies ${c}`,
    entradaComarca: (c) => `Calls from local bodies ${c} still accepting applications. Calls from the Catalan government apply across Catalonia and you will find them in the`,
    llistatGeneral: 'main listing',
  },
  alta: {
    titol: 'Get new calls by email',
    cosAmbProveidor: 'An email with the calls opening in Catalonia, explained in plain language. You can unsubscribe whenever you like.', botoProveidor: 'Send me alerts',
    placeholder: 'you@email.com',
  },
  disclaimer: 'This is an orientative summary, not advice. It describes who the call is aimed at according to the published data; it does not determine whether you are eligible. The conditions that count are those in the official terms. Always check the deadlines and requirements in the official document before applying.',
  fontData: {
    font: (f) => `Source: ${f}.`, recollides: (d) => `Data collected on ${d}.`,
    terminiBaix: 'The deadline for this call is not published as a structured date at source, only as free text, so we have not been able to verify it.',
  },
  peu: {
    descripcio: 'is an independent project. It is not an official website and has no connection with any public administration. The data comes from open sources and every entry links to the official call.',
    avis: 'Legal notice and sources',
  },
  noTrobat: {
    titol: 'Page not found', descripcio: 'This page does not exist on Convocat.',
    h1: 'This page is not here',
    cos: 'The link may have been copied wrong. Calls we have published keep their page even after the deadline has passed, so a link from an old email should still work.',
    anarInici: 'See the open calls', anarComarques: 'Browse by county',
  },
  idioma: { etiqueta: 'Language' },
};

const TAULA: Record<Idioma, Textos> = { ca, es, en };

export function t(idioma: Idioma): Textos {
  return TAULA[idioma];
}

export function esIdioma(v: string | undefined): v is Idioma {
  return !!v && (IDIOMES as readonly string[]).includes(v);
}

export function terminiLlegible(dies: number | null, idioma: Idioma): string {
  const x = t(idioma).termini;
  if (dies === null) return x.sense;
  if (dies < 0) return x.tancat;
  if (dies === 0) return x.ultimDia;
  if (dies === 1) return x.unDia;
  return x.dies(dies);
}

/** Els idiomes que no són el per defecte, per construir el desplegable i els hreflang. */
export const ALTRES_IDIOMES = IDIOMES.filter((i) => i !== IDIOMA_PER_DEFECTE);
