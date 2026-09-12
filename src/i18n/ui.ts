import { withBase } from '../site';

export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const langs = Object.keys(languages) as Lang[];
export const defaultLang: Lang = 'es';

const es = {
  'skip.main': 'Saltar al contenido',
  'nav.label': 'Secciones',
  'nav.progress': 'Progreso de lectura',
  'cta.contact': 'Escríbeme',
  'theme.dark': 'Modo oscuro',
  'menu.open': 'Menú',
  'menu.close': 'Cerrar menú',
  'lang.label': 'Idioma',
  'lang.current': 'Idioma actual',
  'link.external': '(enlace externo)',
  'code.example': 'ejemplo de código',
  'footer.place': 'El Alto, Bolivia',
  'notFound.title': 'Página no encontrada',
  'notFound.body': 'Esta dirección no existe o cambió de sitio.',
  'notFound.home': 'Volver al inicio',
  'section.experience': 'Experiencia',
  'section.projects': 'Proyectos',
  'section.track': 'Trayectoria',
  'section.about': 'Sobre mí',
  'section.education': 'Formación',
  'section.contact': 'Contacto',
} as const;

export type UiKey = keyof typeof es;

const en: Record<UiKey, string> = {
  'skip.main': 'Skip to content',
  'nav.label': 'Sections',
  'nav.progress': 'Reading progress',
  'cta.contact': 'Email me',
  'theme.dark': 'Dark mode',
  'menu.open': 'Menu',
  'menu.close': 'Close menu',
  'lang.label': 'Language',
  'lang.current': 'Current language',
  'link.external': '(external link)',
  'code.example': 'code sample',
  'footer.place': 'El Alto, Bolivia',
  'notFound.title': 'Page not found',
  'notFound.body': 'This address does not exist or has moved.',
  'notFound.home': 'Back to the home page',
  'section.experience': 'Experience',
  'section.projects': 'Projects',
  'section.track': 'Track record',
  'section.about': 'About',
  'section.education': 'Education',
  'section.contact': 'Contact',
};

const ui: Record<Lang, Record<UiKey, string>> = { es, en };

export function useTranslations(lang: Lang) {
  return (key: UiKey) => ui[lang][key];
}

/** Sections in page order. */
export const sections = [
  { key: 'section.experience', id: { es: 'experiencia', en: 'experience' } },
  { key: 'section.projects', id: { es: 'proyectos', en: 'projects' } },
  { key: 'section.track', id: { es: 'trayectoria', en: 'track-record' } },
  { key: 'section.about', id: { es: 'sobre-mi', en: 'about' } },
  { key: 'section.education', id: { es: 'formacion', en: 'education' } },
  { key: 'section.contact', id: { es: 'contacto', en: 'contact' } },
] as const satisfies ReadonlyArray<{ key: UiKey; id: Record<Lang, string> }>;

export function sectionId(key: (typeof sections)[number]['key'], lang: Lang) {
  return sections.find((section) => section.key === key)!.id[lang];
}

/** Home page of a language: the default one lives at the root, the rest under /<lang>/. */
export function langHome(lang: Lang) {
  return withBase(lang === defaultLang ? '' : `${lang}/`);
}

/** BCP 47 tag used in `lang`, `hreflang` and Open Graph locales. */
export const locales: Record<Lang, { hreflang: string; og: string }> = {
  es: { hreflang: 'es', og: 'es_BO' },
  en: { hreflang: 'en', og: 'en_US' },
};
