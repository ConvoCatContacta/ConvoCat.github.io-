/**
 * El registre d'ens locals guarda les comarques sense article ("Pla de l'Estany", "Selva"),
 * però en català l'article forma part del nom i la preposició s'hi contrau: "del Pla de
 * l'Estany", "a la Selva", "a l'Alt Empordà". Sense aquesta taula el lloc escriu malament
 * el seu propi contingut, que és justament el que promet fer bé.
 *
 * Osona i Aran són les dues que no porten article.
 */
type Article = 'el' | 'la' | "l'" | 'les' | null;

const ARTICLES: Record<string, Article> = {
  'Alt Camp': "l'", 'Alt Empordà': "l'", 'Alt Penedès': "l'", 'Alt Urgell': "l'",
  'Alta Ribagorça': "l'", 'Anoia': "l'", 'Aran': null,
  'Bages': 'el', 'Baix Camp': 'el', 'Baix Ebre': 'el', 'Baix Empordà': 'el',
  'Baix Llobregat': 'el', 'Baix Penedès': 'el', 'Barcelonès': 'el', 'Berguedà': 'el',
  'Cerdanya': 'la', 'Conca de Barberà': 'la',
  'Garraf': 'el', 'Garrigues': 'les', 'Garrotxa': 'la', 'Gironès': 'el',
  'Lluçanès': 'el',
  'Maresme': 'el', 'Moianès': 'el', 'Montsià': 'el',
  'Noguera': 'la', 'Osona': null,
  'Pallars Jussà': 'el', 'Pallars Sobirà': 'el', 'Pla de l\'Estany': 'el',
  'Pla d\'Urgell': 'el', 'Priorat': 'el',
  'Ribera d\'Ebre': 'la', 'Ripollès': 'el',
  'Segarra': 'la', 'Segrià': 'el', 'Selva': 'la', 'Solsonès': 'el',
  'Tarragonès': 'el', 'Terra Alta': 'la',
  'Urgell': "l'",
  'Vallès Occidental': 'el', 'Vallès Oriental': 'el',
};

/** "el Gironès", "la Selva", "l'Anoia", "Osona". */
export function comarcaAmbArticle(nom: string): string {
  const article = ARTICLES[nom];
  if (!article) return nom;
  return article === "l'" ? `l'${nom}` : `${article} ${nom}`;
}

/**
 * Contrau la preposició amb l'article: de + el = del, a + el = al; la, les i l' no contrauen,
 * i davant de vocal sense article "de" s'apostrofa ("d'Osona").
 */
export function comarcaAmb(preposicio: 'de' | 'a', nom: string): string {
  const article = ARTICLES[nom];

  switch (article) {
    case 'el':
      return `${preposicio === 'de' ? 'del' : 'al'} ${nom}`;
    case 'les':
      return `${preposicio} les ${nom}`;
    case 'la':
      return `${preposicio} la ${nom}`;
    case "l'":
      return `${preposicio} l'${nom}`;
    default:
      if (preposicio === 'de') return /^[aeiouàèéíòóúAEIOU]/.test(nom) ? `d'${nom}` : `de ${nom}`;
      return `a ${nom}`;
  }
}
