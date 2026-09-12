import type { Idioma } from './textos.ts';

/**
 * Guia genèrica de com es demana un ajut públic a Catalunya.
 *
 * Escrita a mà i deliberadament **genèrica**: descriu el procediment administratiu comú, no
 * els passos d'una convocatòria concreta. Generar instruccions per convocatòria amb un model
 * seria assessorament, i equivocar-se en quin formulari s'ha d'omplir té conseqüències reals
 * per a qui s'hi juga els diners.
 *
 * Cada secció remet a la font oficial perquè qui llegeix pugui comprovar-ho i perquè, si el
 * procediment canvia, l'enllaç continuï portant a la versió vigent.
 */
export type Bloc = { titol: string; text: string; llista?: string[] };

export type Guia = {
  titolPagina: string;
  descripcio: string;
  h1: string;
  entrada: string;
  avis: string;
  blocs: Bloc[];
  enllacos: { titol: string; items: { nom: string; url: string; nota: string }[] };
  fitxa: { titol: string; ambSeu: string; senseSeu: string; enllacGuia: string };
};

const URL_GENCAT = 'https://web.gencat.cat/ca/tramits';
const URL_CANAL = 'https://canalempresa.gencat.cat';
const URL_IDCAT = 'https://www.aoc.cat/serveis/idcat-mobil/';
const URL_CLAVE = 'https://www.clave.gob.es';
const URL_BDNS = 'https://www.infosubvenciones.es/bdnstrans/GE/ca/index';

const ca: Guia = {
  titolPagina: 'Com es demana un ajut',
  descripcio:
    "Guia general del procés per sol·licitar un ajut o una subvenció pública a Catalunya: identificació digital, on es presenta i quina documentació sol caldre.",
  h1: 'Com es demana un ajut',
  entrada:
    "El tràmit canvia a cada convocatòria, però l'esquelet és gairebé sempre el mateix. Aquesta pàgina explica aquest esquelet perquè sàpigues què t'espera abans d'obrir el formulari.",
  avis:
    "Això és una orientació general, no assessorament ni instruccions per a cap convocatòria concreta. Els passos, els formularis i la documentació que valen són els de les bases reguladores de cada convocatòria. Si hi ha contradicció, mana sempre el document oficial.",
  blocs: [
    {
      titol: '1. Necessitaràs una identificació digital',
      text: "Gairebé tots els tràmits es fan per internet i demanen acreditar qui ets. Les opcions més habituals a Catalunya són:",
      llista: [
        "idCAT Mòbil: la més senzilla per a persones físiques. Es dona d'alta en línia amb el DNI i la targeta sanitària, i funciona amb un codi que arriba al mòbil. No cal instal·lar res.",
        'Certificat digital (idCAT, FNMT o el del DNI electrònic): és el que necessiten les empreses i entitats. Cal instal·lar-lo al navegador.',
        "Cl@ve: sistema estatal, per als tràmits de l'Administració General de l'Estat.",
      ],
    },
    {
      titol: '2. Si ets empresa o entitat, has de fer-ho telemàticament',
      text: "La llei del procediment administratiu obliga les persones jurídiques —empreses, associacions, fundacions, cooperatives— a relacionar-se amb l'administració per mitjans electrònics. No és opcional: una sol·licitud en paper es pot tenir per no presentada. Les persones físiques poden triar, tret que les bases diguin el contrari.",
    },
    {
      titol: '3. On es presenta depèn de qui convoca',
      text: 'Aquesta és la part que més confon, perquè no hi ha una finestreta única:',
      llista: [
        "Generalitat: al portal de tràmits de gencat, o a Canal Empresa si l'ajut va dirigit a empreses i autònoms.",
        "Ajuntaments i consells comarcals: a la seu electrònica de cada ens. Molts fan servir la mateixa plataforma (e-TRAM), així que el formulari s'assembla d'un municipi a l'altre.",
        'Diputacions: a la seva pròpia seu electrònica.',
        'Convocatòries estatals: a la seu electrònica del ministeri o organisme que convoca.',
      ],
    },
    {
      titol: '4. Prepara la documentació abans de començar',
      text: "Les seus electròniques solen tenir sessions curtes i els formularis no sempre guarden l'esborrany. Val la pena tenir-ho tot a mà abans d'entrar. El més habitual és:",
      llista: [
        'NIF o NIE del sol·licitant, i escriptures i poders si és una entitat.',
        "Dades bancàries, sovint en un imprès propi de l'administració (fitxa de creditor o document de designació de compte).",
        "Certificats d'estar al corrent amb Hisenda i la Seguretat Social. Sovint no cal aportar-los: n'hi ha prou amb autoritzar l'administració perquè els consulti, i és una casella del formulari.",
        'Declaració responsable de no estar en cap dels supòsits que impedeixen ser beneficiari.',
        'Memòria del projecte i pressupost, si la convocatòria els demana.',
      ],
    },
    {
      titol: '5. Quan presentis, guarda el justificant',
      text: "En registrar la sol·licitud rebràs un justificant amb data, hora i número d'expedient. Guarda'l: és la prova que has presentat dins de termini i el que et permetrà fer el seguiment.",
    },
    {
      titol: '6. Què passa després',
      text: "Si falta documentació, l'administració et requerirà que ho esmenis i et donarà un termini per fer-ho, normalment deu dies hàbils. Aquests requeriments es notifiquen electrònicament, així que revisa la seu o el correu que hi hagis indicat: si el termini passa sense resposta, la sol·licitud es pot arxivar. Si te'l concedeixen, després caldrà justificar la despesa en els terminis que diguin les bases.",
    },
  ],
  enllacos: {
    titol: 'Enllaços oficials',
    items: [
      { nom: 'Tràmits gencat', url: URL_GENCAT, nota: 'Portal de tràmits de la Generalitat.' },
      { nom: 'Canal Empresa', url: URL_CANAL, nota: 'Tràmits per a empreses i autònoms.' },
      { nom: 'idCAT Mòbil', url: URL_IDCAT, nota: 'Alta de la identificació digital més senzilla.' },
      { nom: 'Cl@ve', url: URL_CLAVE, nota: "Identificació per als tràmits de l'Estat." },
      { nom: 'BDNS', url: URL_BDNS, nota: 'Cercador oficial de subvencions.' },
    ],
  },
  fitxa: {
    titol: 'Com es demana',
    ambSeu:
      "Aquesta convocatòria indica una seu electrònica, que trobaràs al botó de més amunt. Comprova sempre a les bases oficials quins formularis i quina documentació demana.",
    senseSeu:
      "Aquesta convocatòria no publica cap enllaç de tramitació a les fonts que consultem. El lloc on es presenta i els formularis surten a les bases oficials, i normalment el tràmit es fa a la seu electrònica de qui convoca.",
    enllacGuia: "Guia general de com es demana un ajut",
  },
};

const es: Guia = {
  titolPagina: 'Cómo se pide una ayuda',
  descripcio:
    'Guía general del proceso para solicitar una ayuda o subvención pública en Cataluña: identificación digital, dónde se presenta y qué documentación suele hacer falta.',
  h1: 'Cómo se pide una ayuda',
  entrada:
    'El trámite cambia en cada convocatoria, pero el esqueleto es casi siempre el mismo. Esta página explica ese esqueleto para que sepas qué te espera antes de abrir el formulario.',
  avis:
    'Esto es una orientación general, no asesoramiento ni instrucciones para ninguna convocatoria concreta. Los pasos, los formularios y la documentación que valen son los de las bases reguladoras de cada convocatoria. Si hay contradicción, manda siempre el documento oficial.',
  blocs: [
    {
      titol: '1. Necesitarás una identificación digital',
      text: 'Casi todos los trámites se hacen por internet y piden acreditar quién eres. Las opciones más habituales en Cataluña son:',
      llista: [
        'idCAT Mòbil: la más sencilla para personas físicas. Se da de alta en línea con el DNI y la tarjeta sanitaria, y funciona con un código que llega al móvil. No hay que instalar nada.',
        'Certificado digital (idCAT, FNMT o el del DNI electrónico): es el que necesitan las empresas y entidades. Hay que instalarlo en el navegador.',
        'Cl@ve: sistema estatal, para los trámites de la Administración General del Estado.',
      ],
    },
    {
      titol: '2. Si eres empresa o entidad, tienes que hacerlo telemáticamente',
      text: 'La ley del procedimiento administrativo obliga a las personas jurídicas —empresas, asociaciones, fundaciones, cooperativas— a relacionarse con la administración por medios electrónicos. No es opcional: una solicitud en papel puede tenerse por no presentada. Las personas físicas pueden elegir, salvo que las bases digan lo contrario.',
    },
    {
      titol: '3. Dónde se presenta depende de quién convoca',
      text: 'Esta es la parte que más confunde, porque no hay una ventanilla única:',
      llista: [
        'Generalitat: en el portal de trámites de gencat, o en Canal Empresa si la ayuda va dirigida a empresas y autónomos.',
        'Ayuntamientos y consejos comarcales: en la sede electrónica de cada ente. Muchos usan la misma plataforma (e-TRAM), así que el formulario se parece de un municipio a otro.',
        'Diputaciones: en su propia sede electrónica.',
        'Convocatorias estatales: en la sede electrónica del ministerio u organismo que convoca.',
      ],
    },
    {
      titol: '4. Prepara la documentación antes de empezar',
      text: 'Las sedes electrónicas suelen tener sesiones cortas y los formularios no siempre guardan el borrador. Vale la pena tenerlo todo a mano antes de entrar. Lo más habitual es:',
      llista: [
        'NIF o NIE del solicitante, y escrituras y poderes si es una entidad.',
        'Datos bancarios, a menudo en un impreso propio de la administración (ficha de acreedor o documento de designación de cuenta).',
        'Certificados de estar al corriente con Hacienda y la Seguridad Social. A menudo no hay que aportarlos: basta con autorizar a la administración a consultarlos, y es una casilla del formulario.',
        'Declaración responsable de no estar en ninguno de los supuestos que impiden ser beneficiario.',
        'Memoria del proyecto y presupuesto, si la convocatoria los pide.',
      ],
    },
    {
      titol: '5. Cuando presentes, guarda el justificante',
      text: 'Al registrar la solicitud recibirás un justificante con fecha, hora y número de expediente. Guárdalo: es la prueba de que has presentado dentro de plazo y lo que te permitirá hacer el seguimiento.',
    },
    {
      titol: '6. Qué pasa después',
      text: 'Si falta documentación, la administración te requerirá que lo subsanes y te dará un plazo para hacerlo, normalmente diez días hábiles. Estos requerimientos se notifican electrónicamente, así que revisa la sede o el correo que hayas indicado: si el plazo pasa sin respuesta, la solicitud puede archivarse. Si te la conceden, después habrá que justificar el gasto en los plazos que digan las bases.',
    },
  ],
  enllacos: {
    titol: 'Enlaces oficiales',
    items: [
      { nom: 'Trámites gencat', url: URL_GENCAT, nota: 'Portal de trámites de la Generalitat.' },
      { nom: 'Canal Empresa', url: URL_CANAL, nota: 'Trámites para empresas y autónomos.' },
      { nom: 'idCAT Mòbil', url: URL_IDCAT, nota: 'Alta de la identificación digital más sencilla.' },
      { nom: 'Cl@ve', url: URL_CLAVE, nota: 'Identificación para los trámites del Estado.' },
      { nom: 'BDNS', url: URL_BDNS, nota: 'Buscador oficial de subvenciones.' },
    ],
  },
  fitxa: {
    titol: 'Cómo se pide',
    ambSeu:
      'Esta convocatoria indica una sede electrónica, que encontrarás en el botón de más arriba. Comprueba siempre en las bases oficiales qué formularios y qué documentación pide.',
    senseSeu:
      'Esta convocatoria no publica ningún enlace de tramitación en las fuentes que consultamos. El lugar donde se presenta y los formularios salen en las bases oficiales, y normalmente el trámite se hace en la sede electrónica de quien convoca.',
    enllacGuia: 'Guía general de cómo se pide una ayuda',
  },
};

const en: Guia = {
  titolPagina: 'How to apply',
  descripcio:
    'A general guide to applying for a public grant in Catalonia: digital identification, where to submit and what documents are usually required.',
  h1: 'How to apply',
  entrada:
    'The procedure changes with every call, but the skeleton is almost always the same. This page explains that skeleton so you know what to expect before you open the form.',
  avis:
    'This is general orientation, not advice, and not instructions for any specific call. The steps, forms and documents that count are those in the official terms of each call. Where they differ from this page, the official document always prevails.',
  blocs: [
    {
      titol: '1. You will need a digital identity',
      text: 'Almost every procedure is online and requires proving who you are. The usual options in Catalonia are:',
      llista: [
        'idCAT Mòbil: the simplest option for individuals. You register online with your ID and health card, and it works with a code sent to your phone. Nothing to install.',
        'Digital certificate (idCAT, FNMT or the one on the Spanish electronic ID card): this is what companies and organisations need. It has to be installed in your browser.',
        'Cl@ve: the Spanish state system, used for central government procedures.',
      ],
    },
    {
      titol: '2. Companies and organisations must apply online',
      text: 'Spanish administrative law requires legal entities (companies, associations, foundations, cooperatives) to deal with the administration electronically. It is not optional: a paper application may be treated as not submitted. Individuals can choose, unless the call says otherwise.',
    },
    {
      titol: '3. Where you apply depends on who is offering it',
      text: 'This is the most confusing part, because there is no single front door:',
      llista: [
        'Catalan government: through the gencat procedures portal, or Canal Empresa if the grant is aimed at companies and the self-employed.',
        'Town and county councils: through each body’s own electronic office. Many use the same platform (e-TRAM), so the form looks similar from one municipality to the next.',
        'Provincial councils: through their own electronic office.',
        'National calls: through the electronic office of the ministry or agency offering the grant.',
      ],
    },
    {
      titol: '4. Get your documents ready before you start',
      text: 'Electronic offices tend to have short sessions and the forms do not always save a draft. It is worth having everything to hand before you log in. Most often you will need:',
      llista: [
        'The applicant’s tax ID, plus incorporation documents and powers of attorney for an organisation.',
        'Bank details, often on the administration’s own form (a creditor form or account designation document).',
        'Certificates showing you are up to date with the tax office and social security. Often you do not need to supply them: ticking a box authorising the administration to check is enough.',
        'A declaration that none of the circumstances barring you from being a beneficiary apply to you.',
        'A project description and budget, if the call asks for them.',
      ],
    },
    {
      titol: '5. Keep the submission receipt',
      text: 'When you register the application you will get a receipt with the date, time and file number. Keep it: it is your proof that you applied in time and what lets you track the file.',
    },
    {
      titol: '6. What happens next',
      text: 'If something is missing, the administration will ask you to fix it and give you a deadline, usually ten working days. These requests are notified electronically, so check the electronic office or the address you gave: if the deadline passes with no reply, the application can be shelved. If the grant is awarded, you will later have to justify the spending within the deadlines set in the terms.',
    },
  ],
  enllacos: {
    titol: 'Official links',
    items: [
      { nom: 'gencat procedures', url: URL_GENCAT, nota: 'The Catalan government procedures portal.' },
      { nom: 'Canal Empresa', url: URL_CANAL, nota: 'Procedures for companies and the self-employed.' },
      { nom: 'idCAT Mòbil', url: URL_IDCAT, nota: 'Registering the simplest digital identity.' },
      { nom: 'Cl@ve', url: URL_CLAVE, nota: 'Identification for central government procedures.' },
      { nom: 'BDNS', url: URL_BDNS, nota: 'The official grants database.' },
    ],
  },
  fitxa: {
    titol: 'How to apply',
    ambSeu:
      'This call lists an electronic office, linked in the button above. Always check the official terms for which forms and documents are required.',
    senseSeu:
      'This call does not publish an application link in the sources we read. Where to apply and which forms to use are set out in the official terms, and the procedure is normally handled through the electronic office of whoever is offering the grant.',
    enllacGuia: 'General guide on how to apply',
  },
};

const TAULA: Record<Idioma, Guia> = { ca, es, en };

export function guia(idioma: Idioma): Guia {
  return TAULA[idioma];
}
