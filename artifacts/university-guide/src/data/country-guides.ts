import { text, type Insight } from './university-details/types';

// These are national guides, never institution-specific verified prices.
// Omitted fields deliberately remain unknown rather than being inferred.
export const additionalCountryGuides: Record<string, Partial<Insight>> = {
  GB: {
    tuitionSummary: text('Ориентир по стране £11 400–38 000 в год', 'Country guide: £11,400–38,000/year'),
    tuition: text(
      'British Council приводит диапазон £11 400–38 000 в год для иностранных студентов бакалавриата. Это общий ориентир, а не цена выбранного вуза; лабораторные и клинические направления могут стоить дороже. Учебный год для диапазона на странице не указан. Жильё, виза и медицинский сбор не включены.',
      'British Council gives an international undergraduate range of £11,400–38,000 per year. This is a country guide, not this university’s fee; laboratory and clinical subjects can cost more. The page does not specify an academic year for the range. Housing, visas and the health surcharge are excluded.',
    ),
    admission: text(
      'По руководству UCAS необходимы подходящие академические квалификации и, когда требуется, подтверждение английского. Минимальные оценки, предметы и дополнительные тесты определяет конкретная программа. Точные условия этого вуза пока не добавлены.',
      'UCAS guidance calls for suitable academic qualifications and, where required, English-language evidence. Each course sets its own grades, subject prerequisites and additional tests. This university’s exact requirements have not yet been added.',
    ),
    application: text(
      'Многие заявления на бакалавриат подаются через UCAS, где можно выбрать до пяти курсов. Проверьте способ подачи и срок именно вашей программы. После принятия предложения для студенческой визы может потребоваться CAS.',
      'Many undergraduate applications use UCAS, which allows up to five course choices. Check your course’s application route and deadline. After accepting an offer, a CAS may be needed for a student visa.',
    ),
    sources: [
      { label: 'British Council — national costs guide', url: 'https://study-uk.britishcouncil.org/moving-uk/cost-studying' },
      { label: 'UCAS — international applications', url: 'https://www.ucas.com/international/international-students/faqs-for-international-students' },
    ],
  },
  FR: {
    tuitionSummary: text('Ориентир для госвузов вне ЕС €2 902 в год · бакалавриат 2026/27', 'Public-university non-EU guide: €2,902/year · bachelor 2026/27'),
    tuition: text(
      'Campus France указывает на 2026/27: бакалавриат €178 в год для подходящих студентов ЕС/ЕЭЗ/Швейцарии; дифференцированный взнос для студентов вне ЕС — €2 902, магистратура — €3 950. Действуют исключения и освобождения. Частные вузы обычно €6 000–18 000 в год или больше. Тип и тариф этого учреждения не подтверждены; опубликованные общие ставки нельзя автоматически считать его ценой.',
      'Campus France lists 2026/27 public bachelor fees of €178/year for eligible EU/EEA/Swiss students; differentiated non-EU fees are €2,902 for bachelor’s and €3,950 for master’s. Exemptions apply. Private institutions generally charge €6,000–18,000/year or more. This institution’s type and fee have not been confirmed; national rates must not be treated as its price.',
    ),
    funding: text(
      'Для части государственных программ предусмотрены освобождения от взносов, в том числе по некоторым государственным стипендиям и соглашениям об обмене. Вуз также может рассмотреть индивидуальное освобождение по действующим правилам. Право на льготу именно в этом учреждении не подтверждено.',
      'Some public programmes offer fee waivers, including under certain government scholarships and exchange agreements. Institutions may also consider individual exemptions under current rules. Eligibility at this institution has not been confirmed.',
    ),
    sources: [{ label: 'Campus France — national tuition and exemptions 2026/27', url: 'https://www.campusfrance.org/en/tuition-fees-France' }],
  },
  JP: {
    tuitionSummary: text('Ориентир по стране ¥820 000–1 300 000 за первый год · есть исключения', 'Country guide: ¥820,000–1,300,000 first year · exceptions apply'),
    tuition: text(
      'Официальный Study in Japan приводит средние взносы за первый год бакалавриата вместе со вступительным взносом: национальные вузы около ¥820 000, местные государственные около ¥910 000, частные около ¥1 300 000 без медицины, стоматологии и фармации; для этой отдельной группы частных программ около ¥3 800 000. Это не тариф выбранного вуза и не цена каждого последующего года. Материалы, практика и отдельные экзамены могут оплачиваться дополнительно; год статистики на странице не указан.',
      'Official Study in Japan lists average first-year undergraduate fees including admission: approximately ¥820,000 at national, ¥910,000 at local public and ¥1,300,000 at private universities excluding medical, dental and pharmaceutical programmes; the latter private group is around ¥3,800,000. These are not this university’s fees or recurring-year prices. Materials, practical training and some exams may cost extra; the page does not state the statistics year.',
    ),
    sources: [{ label: 'Study in Japan — national first-year fee averages', url: 'https://www.studyinjapan.go.jp/en/planning/academic-fees/' }],
  },
  AU: {
    tuitionSummary: text('Точная стоимость пока не найдена', 'Exact tuition not yet available'),
    tuition: text(
      'Study Australia направляет к стоимости конкретного курса в официальном поиске программ или на сайте учебного заведения. Единую цену для всех вузов и программ источник не устанавливает; подтверждённой суммы для этой карточки пока нет.',
      'Study Australia directs applicants to course-specific fees in its official course search or the provider’s website. It does not set one fee for every institution and course; no confirmed amount has been added to this profile.',
    ),
    admission: text(
      'Общий ориентир Study Australia для бакалавриата — австралийский Year 12 или эквивалент; могут требоваться определённые школьные предметы и английский. Магистратура обычно требует завершённого бакалавриата. Точные оценки и языковой балл нужно проверить у выбранной программы.',
      'Study Australia’s undergraduate guide requires Australian Year 12 or equivalent; prerequisite school subjects and English may apply. Postgraduate entry generally requires a completed undergraduate degree. Confirm exact grades and English scores for your course.',
    ),
    application: text(
      'В зависимости от курса заявление можно подать напрямую через сайт учреждения или уполномоченного агента. После положительного рассмотрения приходит предложение. Подача на визу — отдельный этап; агент не гарантирует визу или работу.',
      'Depending on the course, applications may be submitted directly to the provider or through an authorised agent. Successful applicants receive an offer. Visa applications are a separate step; agents cannot guarantee a visa or employment.',
    ),
    funding: text(
      'В официальном поиске Study Australia есть раздел стипендий. Конкретная стипендия или скидка для этого вуза пока не подтверждена.',
      'The official Study Australia course search includes scholarships. No specific award or discount at this institution has been confirmed.',
    ),
    sources: [{ label: 'Study Australia — national application and course guidance', url: 'https://www.studyaustralia.gov.au/en/plan-your-studies/how-to-apply-to-study' }],
  },
  NL: {
    tuitionSummary: text('Ориентир вне ЕС €9 000–20 000 в год · бакалавриат', 'Non-EU country guide: €9,000–20,000/year · bachelor'),
    tuition: text(
      'Study in NL указывает средний диапазон для бакалавриата вне ЕС/ЕЭЗ €9 000–20 000 в год, магистратуры €12 000–30 000. Для подходящих студентов ЕЭЗ, Швейцарии и Суринама установленный законом взнос на 2026/27 — €2 694 при соблюдении условий, в том числе о предыдущем аналогичном дипломе в Нидерландах. Некоторые учреждения берут €75–100 за обработку заявления. Это ориентиры по стране, а не подтверждённая стоимость этой программы.',
      'Study in NL gives average non-EU/EEA bachelor fees of €9,000–20,000/year and master fees of €12,000–30,000. The 2026/27 statutory fee is €2,694 for eligible EEA, Swiss and Surinamese students, subject to conditions including previous similar Dutch degrees. Some institutions charge €75–100 in application/handling fees. These are country guides, not confirmed fees for this programme.',
    ),
    sources: [{ label: 'Study in NL — national tuition guidance', url: 'https://www.studyinnl.org/finances/tuition-fees' }],
  },
};
