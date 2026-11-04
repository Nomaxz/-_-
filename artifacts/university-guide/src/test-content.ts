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
  {
    id: 'subject',
    prompt: { ru: 'Какой предмет вы бы выбрали для углублённого изучения', en: 'Which subject would you choose to study in depth' },
    options: [
      { label: { ru: 'Математика и информатика', en: 'Math and computer science' }, areaScores: { technology: 2, science: 1 } },
      { label: { ru: 'Биология и физика', en: 'Biology and physics' }, areaScores: { science: 2, technology: 1 } },
      { label: { ru: 'История и общество', en: 'History and society' }, areaScores: { people: 2, communication: 1 } },
      { label: { ru: 'Литература и языки', en: 'Literature and languages' }, areaScores: { communication: 2, creative: 1 } },
    ],
  },
  {
    id: 'first-step',
    prompt: { ru: 'С какой задачей вы бы начали новый проект', en: 'Which task would you start with in a new project' },
    options: [
      { label: { ru: 'Настроить инструменты и систему', en: 'Set up the tools and system' }, areaScores: { technology: 2, business: 1 } },
      { label: { ru: 'Собрать данные и проверить факты', en: 'Gather data and check the facts' }, areaScores: { science: 2, technology: 1 } },
      { label: { ru: 'Узнать, что нужно людям', en: 'Find out what people need' }, areaScores: { people: 2, communication: 1 } },
      { label: { ru: 'Продумать, как представить идею', en: 'Plan how to present the idea' }, areaScores: { creative: 2, communication: 1 } },
    ],
  },
  {
    id: 'success',
    prompt: { ru: 'Что для вас будет признаком успешной работы', en: 'What would make you feel a project succeeded' },
    options: [
      { label: { ru: 'Решение работает без сбоев', en: 'The solution works reliably' }, areaScores: { technology: 2, science: 1 } },
      { label: { ru: 'Вывод подтверждён доказательствами', en: 'The conclusion is supported by evidence' }, areaScores: { science: 2, business: 1 } },
      { label: { ru: 'Кому-то стало легче или лучше', en: 'Someone’s situation improved' }, areaScores: { people: 2, communication: 1 } },
      { label: { ru: 'Идею поняли и запомнили', en: 'People understood and remembered the idea' }, areaScores: { communication: 2, creative: 1 } },
    ],
  },
  {
    id: 'decision',
    prompt: { ru: 'На что вы опираетесь, принимая решение', en: 'What do you rely on when making a decision' },
    options: [
      { label: { ru: 'На измерения и факты', en: 'Measurements and facts' }, areaScores: { science: 2, technology: 1 } },
      { label: { ru: 'На потребности людей', en: 'People’s needs' }, areaScores: { people: 2, communication: 1 } },
      { label: { ru: 'На сроки и доступные ресурсы', en: 'Time and available resources' }, areaScores: { business: 2, technology: 1 } },
      { label: { ru: 'На оригинальность и впечатление', en: 'Originality and impact' }, areaScores: { creative: 2, communication: 1 } },
    ],
  },
  {
    id: 'free-time',
    prompt: { ru: 'Какое занятие вам обычно интереснее', en: 'Which activity do you usually find most interesting' },
    options: [
      { label: { ru: 'Собрать или улучшить что-то', en: 'Build or improve something' }, areaScores: { technology: 2, creative: 1 } },
      { label: { ru: 'Узнать, как устроено явление', en: 'Learn how a phenomenon works' }, areaScores: { science: 2, people: 1 } },
      { label: { ru: 'Обсудить идеи и помочь советом', en: 'Discuss ideas and offer advice' }, areaScores: { people: 2, communication: 1 } },
      { label: { ru: 'Придумать историю или оформление', en: 'Create a story or visual design' }, areaScores: { creative: 2, communication: 1 } },
    ],
  },
  {
    id: 'team-style',
    prompt: { ru: 'Какую роль вы чаще берёте в команде', en: 'Which role do you often take in a team' },
    options: [
      { label: { ru: 'Разобраться, как всё устроено', en: 'Figure out how things work' }, areaScores: { technology: 2, science: 1 } },
      { label: { ru: 'Организовать план и сроки', en: 'Organize the plan and schedule' }, areaScores: { business: 2, communication: 1 } },
      { label: { ru: 'Поддержать участников и наладить диалог', en: 'Support teammates and keep communication clear' }, areaScores: { people: 2, communication: 1 } },
      { label: { ru: 'Предложить творческую концепцию', en: 'Suggest a creative concept' }, areaScores: { creative: 2, business: 1 } },
    ],
  },
  {
    id: 'impact',
    prompt: { ru: 'Какую перемену вам хотелось бы увидеть', en: 'What kind of change would you like to see' },
    options: [
      { label: { ru: 'Технологии решают больше повседневных задач', en: 'Technology solves more everyday problems' }, areaScores: { technology: 2, business: 1 } },
      { label: { ru: 'Новые знания помогают принимать решения', en: 'New knowledge helps people make decisions' }, areaScores: { science: 2, communication: 1 } },
      { label: { ru: 'У людей больше возможностей для развития', en: 'People have more opportunities to grow' }, areaScores: { people: 2, business: 1 } },
      { label: { ru: 'Культура становится доступнее и заметнее', en: 'Culture becomes more accessible and visible' }, areaScores: { creative: 2, communication: 1 } },
    ],
  },
  {
    id: 'learning',
    prompt: { ru: 'Как вам удобнее осваивать новую тему', en: 'How do you prefer to learn a new topic' },
    options: [
      { label: { ru: 'Практиковаться на технических задачах', en: 'Practice with technical challenges' }, areaScores: { technology: 2, business: 1 } },
      { label: { ru: 'Ставить вопросы и проверять гипотезы', en: 'Ask questions and test hypotheses' }, areaScores: { science: 2, people: 1 } },
      { label: { ru: 'Обсуждать с другими и объяснять', en: 'Discuss it with others and explain it' }, areaScores: { communication: 2, people: 1 } },
      { label: { ru: 'Пробовать разные способы выражения', en: 'Experiment with different ways to express it' }, areaScores: { creative: 2, technology: 1 } },
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
