export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

const es = {
  'skip.main': 'Saltar al contenido',
  'nav.label': 'Secciones',
  'nav.home': 'Inicio',
  'cta.contact': 'Escríbeme',
  'theme.dark': 'Modo oscuro',
  'menu.open': 'Menú',
  'menu.close': 'Cerrar menú',
  'link.external': '(enlace externo)',
  'footer.place': 'El Alto, Bolivia',
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
  'nav.home': 'Home',
  'cta.contact': 'Email me',
  'theme.dark': 'Dark mode',
  'menu.open': 'Menu',
  'menu.close': 'Close menu',
  'link.external': '(external link)',
  'footer.place': 'El Alto, Bolivia',
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

/** Sections in page order. Letters mimic the problem letters of an ICPC set. */
export const sections = [
  { letter: 'A', key: 'section.experience', id: { es: 'experiencia', en: 'experience' } },
  { letter: 'B', key: 'section.projects', id: { es: 'proyectos', en: 'projects' } },
  { letter: 'C', key: 'section.track', id: { es: 'trayectoria', en: 'track-record' } },
  { letter: 'D', key: 'section.about', id: { es: 'sobre-mi', en: 'about' } },
  { letter: 'E', key: 'section.education', id: { es: 'formacion', en: 'education' } },
  { letter: 'F', key: 'section.contact', id: { es: 'contacto', en: 'contact' } },
] as const satisfies ReadonlyArray<{ letter: string; key: UiKey; id: Record<Lang, string> }>;

export function sectionId(key: (typeof sections)[number]['key'], lang: Lang) {
  return sections.find((section) => section.key === key)!.id[lang];
}
