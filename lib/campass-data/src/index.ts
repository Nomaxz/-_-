export type Language = 'ru' | 'en';
export type Localized = Record<Language, string>;
export const fields = {
  technology: { ru: 'IT и инженерия', en: 'IT and engineering' },
  medicine: { ru: 'Медицина', en: 'Medicine' },
  business: { ru: 'Бизнес и экономика', en: 'Business and economics' },
  arts: { ru: 'Искусство и дизайн', en: 'Arts and design' },
  science: { ru: 'Естественные науки', en: 'Natural sciences' },
  law: { ru: 'Право', en: 'Law' },
  psychology: { ru: 'Психология', en: 'Psychology' },
};
export const levels = {
  bachelor: { ru: 'Бакалавриат и первый диплом', en: 'Undergraduate and first degree' },
  master: { ru: 'Магистратура', en: 'Master’s degree' },
};
export type Field = keyof typeof fields;
export type Level = keyof typeof levels;
export type Programme = { id: string; title: Localized; field: Field; level: Level; source: string };
const p = (id: string, ru: string, en: string, field: Field, level: Level, source: string): Programme =>
  ({ id, title: { ru, en }, field, level, source });
const ox = 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/';
// Only programmes individually found on institution websites. These lists are
// deliberately partial; do not infer programme availability from a school's name.
export const programmes: Readonly<Record<string, readonly Programme[]>> = {
  'DE:Technische Universität München': [
    p('tum-informatics-bsc', 'Информатика BSc', 'Informatics BSc', 'technology', 'bachelor', 'https://www.tum.de/en/studies/degree-programs/detail/informatics-bachelor-of-science-bsc'),
  ],
  'US:Massachusetts Institute of Technology': [
    p('mit-cs-sb', 'Компьютерные науки и инженерия SB', 'Computer Science and Engineering SB', 'technology', 'bachelor', 'https://catalog.mit.edu/degree-charts/computer-science-engineering-course-6-3/'),
  ],
  'NO:Norwegian University of Science and Technology': [
    p('ntnu-informatics-msc', 'Информатика MSc', 'Informatics MSc', 'technology', 'master', 'https://www.ntnu.edu/studies/msit'),
  ],
  'NO:University of Bergen': [
    p('bergen-informatics-msc', 'Информатика MSc', 'Informatics MSc', 'technology', 'master', 'https://www.uib.no/en/studies/MAMN-INF'),
  ],
  'NO:University of Oslo': [
    p('oslo-informatics-bachelor', 'Информатика — программирование и системная архитектура', 'Informatics — Programming and System Architecture', 'technology', 'bachelor', 'https://www.uio.no/studier/program/informatikk-programmering/'),
  ],
  'CA:University of British Columbia': [
    p('ubc-computer-science-bsc', 'Компьютерные науки BSc — Ванкувер', 'Computer Science BSc — Vancouver', 'technology', 'bachelor', 'https://you.ubc.ca/programs/computer-science-vancouver-bsc'),
  ],
  'IT:University of Bologna': [
    p('bologna-computer-science', 'Компьютерные науки — бакалавриат', 'Computer Science — Bachelor', 'technology', 'bachelor', 'https://www.unibo.it/en/study/first-and-single-cycle-degree/programme/2026/6640'),
  ],
  'CA:McGill University': [
    p('mcgill-bcom', 'Коммерция BCom', 'Bachelor of Commerce', 'business', 'bachelor', 'https://www.mcgill.ca/desautels/programs/bcom/prospective-students'),
  ],
  'AU:University of Sydney': [
    p('sydney-commerce-master', 'Коммерция — магистратура', 'Master of Commerce', 'business', 'master', 'https://www.sydney.edu.au/courses/courses/pc/master-of-commerce.html'),
  ],
  'GB:University of Oxford': [
    p('oxford-cs-ba', 'Компьютерные науки BA', 'Computer Science BA', 'technology', 'bachelor', `${ox}computer-science`),
    p('oxford-law-ba', 'Право BA', 'Law BA', 'law', 'bachelor', `${ox}law-jurisprudence`),
    p('oxford-medicine', 'Медицина BA и BM BCh', 'Medicine BA and BM BCh', 'medicine', 'bachelor', `${ox}medicine`),
    p('oxford-art-bfa', 'Изобразительное искусство BFA', 'Fine Art BFA', 'arts', 'bachelor', `${ox}fine-art`),
    p('oxford-biology-ba', 'Биология BA', 'Biology BA', 'science', 'bachelor', `${ox}biology`),
    p('oxford-economics-ba', 'Экономика и менеджмент BA', 'Economics and Management BA', 'business', 'bachelor', `${ox}economics-and-management`),
    p('oxford-psychology-ba', 'Экспериментальная психология BA', 'Psychology (Experimental) BA', 'psychology', 'bachelor', `${ox}psychology-experimental`),
  ],
};
export function universityKey(item: { countryCode: string; name: string }): string {
  return `${item.countryCode}:${item.name}`;
}
export function getProgrammes(item: { countryCode: string; name: string }): readonly Programme[] {
  return programmes[universityKey(item)] ?? [];
}
export function matchesAcademic(item: { countryCode: string; name: string }, field = '', level = '') {
  return (!field && !level) || getProgrammes(item).some((p) => (!field || p.field === field) && (!level || p.level === level));
}
export const checklistTemplates: ReadonlyArray<{ key: string; label: Localized }> = [
  { key: 'requirements', label: { ru: 'Уточнить требования и срок подачи на официальной странице программы', en: 'Confirm programme requirements and deadline on the official website' } },
  { key: 'qualification', label: { ru: 'Подготовить аттестат или диплом и выписку оценок если требуются', en: 'Prepare school certificate or degree and transcripts if required' } },
  { key: 'language', label: { ru: 'Проверить языковые требования и подготовить подтверждение если нужно', en: 'Check language requirements and prepare evidence if needed' } },
  { key: 'documents', label: { ru: 'Подготовить переводы и заверение документов если требуются', en: 'Prepare translations and document certification if required' } },
  { key: 'funding', label: { ru: 'Проверить стоимость сборы и условия стипендий', en: 'Check tuition fees and scholarship conditions' } },
  { key: 'application', label: { ru: 'Заполнить и отправить заявление выбранной программы', en: 'Complete and submit the programme application' } },
];
