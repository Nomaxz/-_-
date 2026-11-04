export type Language = 'ru' | 'en';
export type LocalizedText = Record<Language, string>;

export type TestQuestion = {
  id: string;
  prompt: LocalizedText;
  options: { label: LocalizedText; areaScores: Record<string, number> }[];
};

export type TestResult = {
  title: LocalizedText;
  description: LocalizedText;
  suggestedFields: Record<Language, string[]>;
};

export const questions: TestQuestion[] = [
  {
    id: 'curiosity',
    prompt: { ru: 'Какие задачи вам интереснее решать', en: 'Which kinds of problems interest you most' },
    options: [
      { label: { ru: 'Разобраться в технологиях и системах', en: 'Understand technology and systems' }, areaScores: { technology: 2, science: 1 } },
      { label: { ru: 'Изучать людей и общество', en: 'Explore people and society' }, areaScores: { people: 2, communication: 1 } },
      { label: { ru: 'Придумывать визуальные идеи', en: 'Create visual ideas' }, areaScores: { creative: 2, communication: 1 } },
      { label: { ru: 'Искать закономерности в данных', en: 'Find patterns in data' }, areaScores: { science: 2, business: 1 } },
    ],
  },
  {
    id: 'project',
    prompt: { ru: 'Какую роль вы выберете в командном проекте', en: 'Which role would you choose in a team project' },
    options: [
      { label: { ru: 'Собрать прототип и проверить его', en: 'Build and test a prototype' }, areaScores: { technology: 2, science: 1 } },
      { label: { ru: 'Спланировать работу и ресурсы', en: 'Plan the work and resources' }, areaScores: { business: 2, people: 1 } },
      { label: { ru: 'Представить идею аудитории', en: 'Present the idea to an audience' }, areaScores: { communication: 2, creative: 1 } },
      { label: { ru: 'Исследовать тему и объяснить выводы', en: 'Research a topic and explain the findings' }, areaScores: { science: 2, people: 1 } },
    ],
  },
  {
    id: 'environment',
    prompt: { ru: 'В какой учебной среде вы скорее раскроетесь', en: 'Which learning environment would suit you best' },
    options: [
      { label: { ru: 'Лаборатория или техническая команда', en: 'A lab or technical team' }, areaScores: { technology: 2, science: 1 } },
      { label: { ru: 'Общение и работа с людьми', en: 'Discussion and working with people' }, areaScores: { people: 2, communication: 1 } },
      { label: { ru: 'Творческая студия', en: 'A creative studio' }, areaScores: { creative: 2, communication: 1 } },
      { label: { ru: 'Практические задачи и проекты', en: 'Practical challenges and projects' }, areaScores: { business: 2, technology: 1 } },
    ],
  },
  {
    id: 'motivation',
    prompt: { ru: 'Какой результат учёбы вас особенно мотивирует', en: 'Which outcome would motivate you most' },
    options: [
      { label: { ru: 'Создать полезный инструмент или устройство', en: 'Create a useful tool or device' }, areaScores: { technology: 2, creative: 1 } },
      { label: { ru: 'Улучшить качество жизни людей', en: 'Improve people’s quality of life' }, areaScores: { people: 2, science: 1 } },
      { label: { ru: 'Запустить собственный проект', en: 'Start a project of your own' }, areaScores: { business: 2, communication: 1 } },
      { label: { ru: 'Найти новый способ выразить идею', en: 'Find a new way to express an idea' }, areaScores: { creative: 2, people: 1 } },
    ],
  },
];

export const resultAreas: Record<string, TestResult> = {
  technology: {
    title: { ru: 'Технологии и инженерия', en: 'Technology and engineering' },
    description: {
      ru: 'Вам могут подойти направления, где идеи превращаются в работающие системы. Это отправная точка для дальнейшего изучения.',
      en: 'You may enjoy fields where ideas become working systems. Use this as a starting point for further research.',
    },
    suggestedFields: {
      ru: ['Информатика', 'Инженерия', 'Робототехника', 'Прикладная математика'],
      en: ['Computer science', 'Engineering', 'Robotics', 'Applied mathematics'],
    },
  },
  people: {
    title: { ru: 'Человек и общество', en: 'People and society' },
    description: {
      ru: 'Похоже, вам интересны люди, их опыт и устройство общества. Рассмотрите направления с исследованием и взаимодействием.',
      en: 'You seem interested in people, their experiences, and how society works. Explore fields that combine research and interaction.',
    },
    suggestedFields: {
      ru: ['Психология', 'Социология', 'Образование', 'Международные отношения'],
      en: ['Psychology', 'Sociology', 'Education', 'International relations'],
    },
  },
  creative: {
    title: { ru: 'Творчество и дизайн', en: 'Creative fields and design' },
    description: {
      ru: 'Вам могут быть близки задачи, где нужно формировать идеи и находить выразительные решения.',
      en: 'You may enjoy shaping ideas and finding expressive ways to bring them to life.',
    },
    suggestedFields: {
      ru: ['Дизайн', 'Архитектура', 'Медиа', 'Визуальные коммуникации'],
      en: ['Design', 'Architecture', 'Media', 'Visual communication'],
    },
  },
  science: {
    title: { ru: 'Наука и исследования', en: 'Science and research' },
    description: {
      ru: 'Вас могут заинтересовать системное изучение вопросов, проверка гипотез и работа с доказательствами.',
      en: 'You may be drawn to systematic study, testing hypotheses, and working with evidence.',
    },
    suggestedFields: {
      ru: ['Биология', 'Химия', 'Экономика', 'Аналитика данных'],
      en: ['Biology', 'Chemistry', 'Economics', 'Data analytics'],
    },
  },
  business: {
    title: { ru: 'Бизнес и управление', en: 'Business and management' },
    description: {
      ru: 'Вам могут подойти направления, связанные с планированием, развитием инициатив и практическими решениями.',
      en: 'You may enjoy planning, growing initiatives, and finding practical solutions.',
    },
    suggestedFields: {
      ru: ['Менеджмент', 'Экономика', 'Предпринимательство', 'Логистика'],
      en: ['Management', 'Economics', 'Entrepreneurship', 'Logistics'],
    },
  },
  communication: {
    title: { ru: 'Коммуникации и культура', en: 'Communication and culture' },
    description: {
      ru: 'Похоже, вам близки обмен идеями, ясное изложение и работа с разными аудиториями.',
      en: 'You may enjoy sharing ideas, clear communication, and working with different audiences.',
    },
    suggestedFields: {
      ru: ['Журналистика', 'Коммуникации', 'Лингвистика', 'Культурология'],
      en: ['Journalism', 'Communication', 'Linguistics', 'Cultural studies'],
    },
  },
};
